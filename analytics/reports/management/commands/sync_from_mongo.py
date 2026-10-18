"""
Management command: sync_from_mongo
Idempotently syncs Doctor snapshots and Appointment facts from MongoDB into PostgreSQL/SQLite.
Adheres strictly to privacy regulations: patient IDs are hashed using a salted SHA-256,
and no patient PII (name, email, phone, notes) is stored in the analytics database.
"""
import os
import hashlib
from datetime import datetime, timezone as dt_timezone
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from pymongo import MongoClient
from reports.models import DoctorSnapshot, AppointmentFact


def compute_patient_hash(patient_id: str, salt: str) -> str:
    """Computes a salted SHA-256 digest of patient id."""
    combined = f"{salt}:{patient_id}".encode('utf-8')
    return hashlib.sha256(combined).hexdigest()


class Command(BaseCommand):
    help = 'Idempotently syncs doctors and appointments from MongoDB to the analytics database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate sync without committing any changes to the database.',
        )
        parser.add_argument(
            '--mongo-uri',
            type=str,
            default=None,
            help='Override MONGO_URI from settings/environment.',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        mongo_uri = options.get('mongo_uri') or getattr(settings, 'MONGO_URI', os.environ.get('MONGO_URI', 'mongodb://localhost:27017/healthbook'))
        salt = getattr(settings, 'PATIENT_HASH_SALT', os.environ.get('PATIENT_HASH_SALT', 'default-healthbook-salt-2026'))

        if dry_run:
            self.stdout.write(self.style.WARNING("Running in --dry-run mode: no database records will be created or updated."))

        self.stdout.write(f"Connecting to MongoDB at: {mongo_uri}")
        try:
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            db = client.get_default_database()
            if db is None:
                # Fallback to 'healthbook' database name if URI does not specify one
                db = client['healthbook']
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Failed to connect to MongoDB: {e}"))
            return

        # ---------------------------------------------------------------------
        # 1. Sync Doctors
        # ---------------------------------------------------------------------
        self.stdout.write("Syncing doctors...")
        doctors_coll = db['doctors']
        users_coll = db['users']
        reviews_coll = db['reviews']

        doctors_synced = 0
        doctor_cache = {}

        try:
            cursor = doctors_coll.find({})
            for doc in cursor:
                mongo_id = str(doc.get('_id'))
                user_id = doc.get('user')
                user_name = "Unknown Doctor"
                if user_id:
                    user_data = users_coll.find_one({'_id': user_id})
                    if user_data and 'name' in user_data:
                        user_name = user_data['name']

                # Compute average rating from reviews
                avg_rating = 0.0
                try:
                    pipeline = [
                        {'$match': {'doctor': doc.get('_id')}},
                        {'$group': {'_id': None, 'avg_rating': {'$avg': '$rating'}}}
                    ]
                    rating_agg = list(reviews_coll.aggregate(pipeline))
                    if rating_agg and rating_agg[0].get('avg_rating') is not None:
                        avg_rating = round(float(rating_agg[0]['avg_rating']), 2)
                except Exception as exc:
                    self.stdout.write(self.style.WARNING(f"Could not compute avg_rating for doctor {doc.get('_id')}: {exc}"))

                specialization = doc.get('specialty') or 'General Medicine'
                fee_val = doc.get('fee') or 0.0
                try:
                    fee = Decimal(str(fee_val))
                except Exception:
                    fee = Decimal('0.00')

                if not dry_run:
                    doctor_obj, _ = DoctorSnapshot.objects.update_or_create(
                        mongo_id=mongo_id,
                        defaults={
                            'name': user_name,
                            'specialization': specialization,
                            'fee': fee,
                            'avg_rating': avg_rating,
                            'is_demo': False,
                        }
                    )
                    doctor_cache[mongo_id] = doctor_obj
                else:
                    doctor_cache[mongo_id] = True

                doctors_synced += 1

            self.stdout.write(self.style.SUCCESS(f"Processed {doctors_synced} doctors."))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error querying doctors collection: {e}"))

        # ---------------------------------------------------------------------
        # 2. Sync Appointments
        # ---------------------------------------------------------------------
        self.stdout.write("Syncing appointments...")
        appts_coll = db['appointments']
        appts_synced = 0
        appts_skipped = 0

        try:
            cursor = appts_coll.find({})
            for appt in cursor:
                mongo_id = str(appt.get('_id'))
                doctor_id = str(appt.get('doctor')) if appt.get('doctor') else None
                patient_id = str(appt.get('patient')) if appt.get('patient') else 'anonymous'

                if not doctor_id:
                    appts_skipped += 1
                    continue

                # Ensure doctor exists in DoctorSnapshot
                doctor_obj = None
                if not dry_run:
                    doctor_obj = DoctorSnapshot.objects.filter(mongo_id=doctor_id).first()
                    if not doctor_obj:
                        # Doctor was not found in doctors collection, create minimal stub
                        doctor_obj = DoctorSnapshot.objects.create(
                            mongo_id=doctor_id,
                            name="Unlisted Doctor",
                            specialization="General",
                            fee=Decimal('0.00'),
                            avg_rating=0.0,
                            is_demo=False
                        )

                # Salted SHA-256 for privacy
                patient_hash = compute_patient_hash(patient_id, salt)

                # Parse date
                raw_date = appt.get('date')
                if isinstance(raw_date, str):
                    try:
                        date_val = datetime.strptime(raw_date, '%Y-%m-%d').date()
                    except ValueError:
                        date_val = timezone.now().date()
                elif isinstance(raw_date, datetime):
                    date_val = raw_date.date()
                else:
                    date_val = timezone.now().date()

                # Parse startTime
                raw_time = appt.get('startTime', '09:00')
                if isinstance(raw_time, str):
                    try:
                        time_val = datetime.strptime(raw_time, '%H:%M').time()
                    except ValueError:
                        try:
                            time_val = datetime.strptime(raw_time, '%H:%M:%S').time()
                        except ValueError:
                            time_val = datetime.strptime('09:00', '%H:%M').time()
                else:
                    time_val = datetime.strptime('09:00', '%H:%M').time()

                status = (appt.get('status') or 'pending').lower()
                payment_dict = appt.get('payment') or {}
                payment_status = (payment_dict.get('status') or 'pending').lower()
                
                # Fee
                fee_val = payment_dict.get('amount')
                if fee_val is None and doctor_obj:
                    fee_val = doctor_obj.fee
                try:
                    fee = Decimal(str(fee_val or 0.0))
                except Exception:
                    fee = Decimal('0.00')

                # Timestamps
                created_at = appt.get('createdAt')
                if not isinstance(created_at, datetime):
                    created_at = timezone.now()
                elif created_at.tzinfo is None:
                    created_at = timezone.make_aware(created_at, dt_timezone.utc)

                cancelled_at = None
                if status == 'cancelled':
                    updated_at = appt.get('updatedAt')
                    if isinstance(updated_at, datetime):
                        cancelled_at = updated_at if updated_at.tzinfo else timezone.make_aware(updated_at, dt_timezone.utc)
                    else:
                        cancelled_at = timezone.now()

                rescheduled_count = int(appt.get('rescheduleCount') or 0)

                if not dry_run:
                    AppointmentFact.objects.update_or_create(
                        mongo_id=mongo_id,
                        defaults={
                            'doctor': doctor_obj,
                            'patient_hash': patient_hash,
                            'date': date_val,
                            'start_time': time_val,
                            'status': status,
                            'payment_status': payment_status,
                            'fee': fee,
                            'created_at': created_at,
                            'cancelled_at': cancelled_at,
                            'rescheduled_count': rescheduled_count,
                            'is_demo': False,
                        }
                    )

                appts_synced += 1

            self.stdout.write(self.style.SUCCESS(
                f"Successfully synced {appts_synced} appointments (skipped {appts_skipped})."
            ))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error querying appointments collection: {e}"))

        self.stdout.write(self.style.SUCCESS("MongoDB synchronization finished."))
