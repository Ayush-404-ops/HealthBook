from django.contrib import admin
from .models import DoctorSnapshot, AppointmentFact


@admin.register(DoctorSnapshot)
class DoctorSnapshotAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'fee', 'avg_rating', 'is_demo', 'mongo_id')
    search_fields = ('name', 'specialization', 'mongo_id')
    list_filter = ('is_demo', 'specialization')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AppointmentFact)
class AppointmentFactAdmin(admin.ModelAdmin):
    list_display = ('mongo_id', 'doctor', 'patient_hash', 'date', 'start_time', 'status', 'fee', 'is_demo')
    search_fields = ('mongo_id', 'patient_hash', 'doctor__name')
    list_filter = ('status', 'payment_status', 'is_demo', 'date')
    readonly_fields = ('created_at', 'cancelled_at')
