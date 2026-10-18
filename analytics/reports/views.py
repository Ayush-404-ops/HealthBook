"""
analytics/reports/views.py
Protected views and Matplotlib chart endpoints for HealthBook analytics.
All views enforce @login_required.
"""
import io
from decimal import Decimal
import matplotlib
matplotlib.use('Agg')  # Headless backend for web server
import matplotlib.pyplot as plt
import seaborn as sns

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.db.models import Count, Sum, Q
from .models import DoctorSnapshot, AppointmentFact


def compute_kpis():
    """Calculates summary KPIs across all appointments."""
    total = AppointmentFact.objects.count()
    completed = AppointmentFact.objects.filter(status='completed').count()
    cancelled = AppointmentFact.objects.filter(status='cancelled').count()
    noshow = AppointmentFact.objects.filter(status='no-show').count()
    confirmed = AppointmentFact.objects.filter(status='confirmed').count()
    pending = AppointmentFact.objects.filter(status='pending').count()

    noshow_rate = round((noshow / total * 100), 1) if total > 0 else 0.0
    cancellation_rate = round((cancelled / total * 100), 1) if total > 0 else 0.0

    # Total revenue from completed appointments
    revenue_agg = AppointmentFact.objects.filter(
        status='completed'
    ).aggregate(total_revenue=Sum('fee'))
    revenue = revenue_agg['total_revenue'] or Decimal('0.00')

    return {
        'total': total,
        'completed': completed,
        'cancelled': cancelled,
        'noshow': noshow,
        'confirmed': confirmed,
        'pending': pending,
        'noshow_rate': noshow_rate,
        'cancellation_rate': cancellation_rate,
        'revenue': revenue,
    }


@login_required
def dashboard_view(request):
    """
    Main Analytics & Reporting Dashboard.
    Requires login.
    """
    kpis = compute_kpis()
    top_doctors = DoctorSnapshot.objects.order_by('-avg_rating')[:8]
    recent_appointments = AppointmentFact.objects.select_related('doctor').order_by('-date', '-start_time')[:30]

    context = {
        'kpis': kpis,
        'top_doctors': top_doctors,
        'recent_appointments': recent_appointments,
        'status_choices': AppointmentFact.STATUS_CHOICES,
    }
    return render(request, 'reports/dashboard.html', context)


@login_required
def appointments_filter_api(request):
    """
    JSON API endpoint for AJAX filtering by status or doctor.
    Consumed by the jQuery interactive table filter on the dashboard.
    """
    status = request.GET.get('status', '').strip().lower()
    doctor_id = request.GET.get('doctor', '').strip()

    qs = AppointmentFact.objects.select_related('doctor').all()

    if status and status != 'all':
        qs = qs.filter(status=status)
    if doctor_id:
        qs = qs.filter(doctor_id=doctor_id)

    qs = qs.order_by('-date', '-start_time')[:100]

    data = []
    for appt in qs:
        data.append({
            'mongo_id': appt.mongo_id[:10] + '...',
            'doctor_name': appt.doctor.name,
            'specialization': appt.doctor.specialization,
            'patient_hash': appt.patient_hash[:8] + '...',
            'date': appt.date.strftime('%Y-%m-%d'),
            'start_time': appt.start_time.strftime('%H:%M'),
            'status': appt.status,
            'payment_status': appt.payment_status,
            'fee': str(appt.fee),
            'rescheduled_count': appt.rescheduled_count,
            'is_demo': appt.is_demo,
        })

    return JsonResponse({'status': 'success', 'count': len(data), 'appointments': data})


# ---------------------------------------------------------------------------
# Matplotlib Chart Endpoints (served directly as image/png)
# ---------------------------------------------------------------------------

@login_required
def chart_weekday_view(request):
    """
    Renders Matplotlib/Seaborn bar chart of appointments per weekday.
    """
    # 0 = Monday, 6 = Sunday in Python datetime
    weekday_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    counts = [0] * 7

    appts = AppointmentFact.objects.values_list('date', flat=True)
    for d in appts:
        counts[d.weekday()] += 1

    fig, ax = plt.subplots(figsize=(6.5, 3.8), dpi=100)
    sns.set_theme(style="whitegrid")

    palette = sns.color_palette("Blues_r", n_colors=7)
    bars = ax.bar(weekday_labels, counts, color=palette, edgecolor='#0d6efd', linewidth=1)

    ax.set_title("Appointments by Day of Week", fontsize=12, fontweight='bold', pad=12)
    ax.set_xlabel("Weekday", fontsize=10)
    ax.set_ylabel("Total Bookings", fontsize=10)
    ax.grid(axis='y', linestyle='--', alpha=0.5)

    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8, fontweight='semibold')

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return HttpResponse(buf.getvalue(), content_type='image/png')


@login_required
def chart_hourly_view(request):
    """
    Renders Matplotlib/Seaborn bar chart of appointments per hour of the day.
    """
    hour_counts = {}
    for h in range(8, 20):
        hour_counts[h] = 0

    times = AppointmentFact.objects.values_list('start_time', flat=True)
    for t in times:
        if t.hour in hour_counts:
            hour_counts[t.hour] += 1

    hours = [f"{h:02d}:00" for h in hour_counts.keys()]
    counts = list(hour_counts.values())

    fig, ax = plt.subplots(figsize=(6.5, 3.8), dpi=100)
    sns.set_theme(style="whitegrid")

    palette = sns.color_palette("crest", n_colors=len(hours))
    ax.plot(hours, counts, marker='o', color='#0284c7', linewidth=2.5, markersize=6)
    ax.fill_between(hours, counts, color='#0284c7', alpha=0.15)

    ax.set_title("Appointments by Hour of Day", fontsize=12, fontweight='bold', pad=12)
    ax.set_xlabel("Hour (24h)", fontsize=10)
    ax.set_ylabel("Bookings", fontsize=10)
    plt.xticks(rotation=45, ha='right', fontsize=8)
    ax.grid(True, linestyle='--', alpha=0.5)

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return HttpResponse(buf.getvalue(), content_type='image/png')


@login_required
def chart_status_view(request):
    """
    Renders Donut chart of appointment status breakdown.
    """
    status_counts = AppointmentFact.objects.values('status').annotate(total=Count('id'))
    labels = []
    sizes = []
    colors_map = {
        'completed': '#198754',
        'confirmed': '#0d6efd',
        'pending': '#ffc107',
        'cancelled': '#dc3545',
        'no-show': '#6c757d',
    }
    colors = []

    for item in status_counts:
        st = item['status']
        labels.append(st.capitalize())
        sizes.append(item['total'])
        colors.append(colors_map.get(st, '#6c757d'))

    fig, ax = plt.subplots(figsize=(5, 3.8), dpi=100)
    if sizes and sum(sizes) > 0:
        wedges, texts, autotexts = ax.pie(
            sizes,
            labels=labels,
            autopct='%1.1f%%',
            startangle=140,
            colors=colors,
            pctdistance=0.75,
            wedgeprops=dict(width=0.45, edgecolor='w')
        )
        for autotext in autotexts:
            autotext.set_fontsize(8)
            autotext.set_weight('bold')
    else:
        ax.text(0.5, 0.5, 'No Data', horizontalalignment='center', verticalalignment='center')

    ax.set_title("Appointment Status Breakdown", fontsize=12, fontweight='bold', pad=12)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return HttpResponse(buf.getvalue(), content_type='image/png')
