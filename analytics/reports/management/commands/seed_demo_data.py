"""
Management command: seed_demo_data
Generates ~500 realistic demo appointments and doctors with a seeded random generator.
Enables immediate dashboard analytics, charts, and ML without connecting to MongoDB.
All demo data has is_demo=True.
"""
import random
import hashlib
from datetime import date, time, timedelta, datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from faker import Faker
from reports.models import DoctorSnapshot, AppointmentFact


class Command(BaseCommand):
    help = 'Seeds ~500 realistic demo appointments and demo doctors for reporting and analytics.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=500,
            help='Number of appointment facts to generate (default: 500).',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Purge all existing demo data before seeding.',
        )
        parser.add_argument(
            '--seed',
            type=int,
            default=42,
            help='Random seed for deterministic generation (default: 42).',
        )

    def handle(self, *args, **options):
        count = options.get('count', 500)
        clear = options.get('clear', False)
        seed_val = options.get('seed', 42)

        random.seed(seed_val)
        fake = Faker()
        Faker.seed(seed_val)

        salt = getattr(settings, 'PATIENT_HASH_SALT', 'healthbook-demo-salt-2026')

        if clear:
            self.stdout.write("Clearing existing demo data...")
            deleted_appts, _ = AppointmentFact.objects.filter(is_demo=True).delete()
            deleted_docs, _ = DoctorSnapshot.objects.filter(is_demo=True).delete()
            self.stdout.write(f"Removed {deleted_appts} demo appointments and {deleted_docs} demo doctors.")

        self.stdout.write(f"Seeding demo doctors and {count} appointments (seed={seed_val})...")

        # ---------------------------------------------------------------------
        # 1. Create realistic Demo Doctors
        # ---------------------------------------------------------------------
        specialties = [
            ('Cardiology', Decimal('1200.00'), 4.8),
            ('Dermatology', Decimal('800.00'), 4.6),
            ('Pediatrics', Decimal('700.00'), 4.9),
            ('General Medicine', Decimal('500.00'), 4.5),
            ('Neurology', Decimal('1500.00'), 4.7),
            ('Orthopedics', Decimal('1000.00'), 4.4),
            ('Psychiatry', Decimal('1100.00'), 4.8),
            ('Ophthalmology', Decimal('750.00'), 4.6),
            ('ENT', Decimal('650.00'), 4.3),
            ('Gynecology', Decimal('900.00'), 4.7),
        ]

        doctors = []
        for i, (spec, fee, base_rating) in enumerate(specialties):
            name = f"Dr. {fake.first_name()} {fake.last_name()}"
            rating = round(base_rating + random.uniform(-0.3, 0.2), 2)
            rating = min(5.0, max(3.5, rating))
            mongo_id = f"demo_doc_{seed_val}_{i+1:03d}"

            doctor, _ = DoctorSnapshot.objects.update_or_create(
                mongo_id=mongo_id,
                defaults={
                    'name': name,
                    'specialization': spec,
                    'fee': fee,
                    'avg_rating': rating,
                    'is_demo': True,
                }
            )
            doctors.append(doctor)

        self.stdout.write(f"Created/updated {len(doctors)} demo doctors.")

        # ---------------------------------------------------------------------
        # 2. Generate 500 Realistic Appointments
        # ---------------------------------------------------------------------
        # Status distribution:
        # completed: 65%, confirmed: 15%, cancelled: 12%, no-show: 8%
        statuses = ['completed'] * 65 + ['confirmed'] * 15 + ['cancelled'] * 12 + ['no-show'] * 8
        time_slots = [
            time(9, 0), time(9, 30), time(10, 0), time(10, 30),
            time(11, 0), time(11, 30), time(12, 0),
            time(14, 0), time(14, 30), time(15, 0), time(15, 30),
            time(16, 0), time(16, 30), time(17, 0)
        ]

        # Generate a pool of 120 synthetic patients
        patient_pool = [
            hashlib.sha256(f"{salt}:demo_patient_{p:04d}".encode('utf-8')).hexdigest()
            for p in range(1, 121)
        ]

        base_date = timezone.now().date()
        appointment_instances = []

        for idx in range(1, count + 1):
            mongo_id = f"demo_appt_{seed_val}_{idx:05d}"
            doctor = random.choice(doctors)
            patient_hash = random.choice(patient_pool)

            # Dates spread across past 180 days and next 30 days
            day_offset = random.randint(-180, 30)
            appt_date = base_date + timedelta(days=day_offset)
            appt_time = random.choice(time_slots)

            # If appointment is in future, bias towards confirmed or pending
            if day_offset > 0:
                status = random.choice(['confirmed', 'pending', 'confirmed'])
            else:
                status = random.choice(statuses)

            if status == 'completed':
                payment_status = 'completed'
            elif status == 'cancelled':
                payment_status = random.choice(['refunded', 'pending', 'completed'])
            else:
                payment_status = random.choice(['completed', 'pending'])

            rescheduled_count = random.choices([0, 1, 2], weights=[75, 20, 5])[0]

            created_datetime = timezone.make_aware(
                datetime.combine(appt_date - timedelta(days=random.randint(1, 14)), time(random.randint(8, 20), 0))
            )

            cancelled_datetime = None
            if status == 'cancelled':
                cancelled_datetime = timezone.make_aware(
                    datetime.combine(appt_date - timedelta(days=random.randint(0, 2)), time(random.randint(8, 20), 0))
                )

            appointment_instances.append(
                AppointmentFact(
                    mongo_id=mongo_id,
                    doctor=doctor,
                    patient_hash=patient_hash,
                    date=appt_date,
                    start_time=appt_time,
                    status=status,
                    payment_status=payment_status,
                    fee=doctor.fee,
                    created_at=created_datetime,
                    cancelled_at=cancelled_datetime,
                    rescheduled_count=rescheduled_count,
                    is_demo=True,
                )
            )

        # Batch upsert or bulk create
        AppointmentFact.objects.filter(mongo_id__in=[a.mongo_id for a in appointment_instances]).delete()
        AppointmentFact.objects.bulk_create(appointment_instances, batch_size=200)

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {len(appointment_instances)} demo appointments!"
        ))
