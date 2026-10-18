"""
Management command: export_csv
Exports anonymized AppointmentFact records joined with DoctorSnapshot
to a CSV file for analytical exploration in Jupyter notebooks or pandas.
Adheres strictly to privacy regulations: no patient PII is exported.
"""
import os
import csv
from django.core.management.base import BaseCommand
from django.conf import settings
from reports.models import AppointmentFact


class Command(BaseCommand):
    help = 'Exports anonymized appointment fact records to a CSV file.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default=None,
            help='Output file path for the CSV (defaults to analytics/notebooks/appointments.csv).',
        )

    def handle(self, *args, **options):
        output_path = options.get('output')
        if not output_path:
            notebooks_dir = os.path.join(settings.BASE_DIR, 'notebooks')
            os.makedirs(notebooks_dir, exist_ok=True)
            output_path = os.path.join(notebooks_dir, 'appointments.csv')

        self.stdout.write(f"Exporting appointment facts to {output_path}...")

        fieldnames = [
            'mongo_id',
            'doctor_name',
            'doctor_specialization',
            'doctor_avg_rating',
            'patient_hash',
            'date',
            'start_time',
            'status',
            'payment_status',
            'fee',
            'created_at',
            'cancelled_at',
            'rescheduled_count',
            'is_demo',
        ]

        appts = AppointmentFact.objects.select_related('doctor').all().order_by('date', 'start_time')
        count = 0

        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for a in appts:
                writer.writerow({
                    'mongo_id': a.mongo_id,
                    'doctor_name': a.doctor.name,
                    'doctor_specialization': a.doctor.specialization,
                    'doctor_avg_rating': a.doctor.avg_rating,
                    'patient_hash': a.patient_hash,
                    'date': a.date.strftime('%Y-%m-%d'),
                    'start_time': a.start_time.strftime('%H:%M:%S'),
                    'status': a.status,
                    'payment_status': a.payment_status,
                    'fee': float(a.fee),
                    'created_at': a.created_at.isoformat() if a.created_at else '',
                    'cancelled_at': a.cancelled_at.isoformat() if a.cancelled_at else '',
                    'rescheduled_count': a.rescheduled_count,
                    'is_demo': a.is_demo,
                })
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully exported {count} records to {output_path}"))
