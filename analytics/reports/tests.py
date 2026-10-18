"""
analytics/reports/tests.py
Unit tests covering:
1. Authentication & login protection for all reporting endpoints
2. KPI calculations (total, completed, cancelled, no-show rate, revenue)
3. MongoDB synchronization idempotency, privacy hash verification, and --dry-run
4. Demo data generation and is_demo flag verification
All tests run seamlessly on SQLite.
"""
import sys
import hashlib
from datetime import date, time, datetime
from decimal import Decimal
from unittest.mock import patch, MagicMock

# Python 3.14+ compatibility patch for Django 5.0 BaseContext copy
if sys.version_info >= (3, 14):
    from django.template.context import BaseContext
    def _basecontext_copy(self):
        obj = self.__class__.__new__(self.__class__)
        obj.__dict__.update(self.__dict__)
        obj.dicts = self.dicts[:]
        return obj
    BaseContext.__copy__ = _basecontext_copy

from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.management import call_command
from django.utils import timezone

from reports.models import DoctorSnapshot, AppointmentFact
from reports.views import compute_kpis
from reports.management.commands.sync_from_mongo import compute_patient_hash


class LoginProtectionTests(TestCase):
    """Verifies that all analytics views require authentication."""

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='analyst', password='test-password-123')

    def test_dashboard_requires_login(self):
        url = reverse('reports:dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/accounts/login/', response.url)

    def test_api_appointments_requires_login(self):
        url = reverse('reports:api_appointments')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/accounts/login/', response.url)

    def test_charts_require_login(self):
        for chart_name in ['chart_weekday', 'chart_hourly', 'chart_status']:
            url = reverse(f'reports:{chart_name}')
            response = self.client.get(url)
            self.assertEqual(response.status_code, 302)

    def test_authenticated_user_can_access_dashboard(self):
        self.client.login(username='analyst', password='test-password-123')
        url = reverse('reports:dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Healthcare Operations &amp; Appointment Analytics')


class KPICalculationTests(TestCase):
    """Verifies accuracy of business analytics KPI formulas."""

    def setUp(self):
        self.doctor = DoctorSnapshot.objects.create(
            mongo_id="doc_kpi_01",
            name="Dr. Smith",
            specialization="Cardiology",
            fee=Decimal('500.00'),
            avg_rating=4.8,
            is_demo=False
        )
        base_time = timezone.now()

        # 2 completed appointments with fee=500
        for i in range(2):
            AppointmentFact.objects.create(
                mongo_id=f"appt_comp_{i}",
                doctor=self.doctor,
                patient_hash="hash_01",
                date=date(2026, 8, 10 + i),
                start_time=time(10, 0),
                status='completed',
                fee=Decimal('500.00'),
                created_at=base_time,
            )

        # 1 cancelled appointment
        AppointmentFact.objects.create(
            mongo_id="appt_canc_01",
            doctor=self.doctor,
            patient_hash="hash_02",
            date=date(2026, 8, 15),
            start_time=time(11, 0),
            status='cancelled',
            fee=Decimal('500.00'),
            created_at=base_time,
            cancelled_at=base_time,
        )

        # 1 no-show appointment
        AppointmentFact.objects.create(
            mongo_id="appt_noshow_01",
            doctor=self.doctor,
            patient_hash="hash_03",
            date=date(2026, 8, 16),
            start_time=time(14, 0),
            status='no-show',
            fee=Decimal('500.00'),
            created_at=base_time,
        )

    def test_kpi_counts_and_rates(self):
        # Total = 4 (2 completed, 1 cancelled, 1 no-show)
        kpis = compute_kpis()
        self.assertEqual(kpis['total'], 4)
        self.assertEqual(kpis['completed'], 2)
        self.assertEqual(kpis['cancelled'], 1)
        self.assertEqual(kpis['noshow'], 1)

        # No show rate: 1/4 = 25.0%
        self.assertEqual(kpis['noshow_rate'], 25.0)

        # Cancellation rate: 1/4 = 25.0%
        self.assertEqual(kpis['cancellation_rate'], 25.0)

        # Total revenue: only completed appointments sum up (2 * 500 = 1000.00)
        self.assertEqual(kpis['revenue'], Decimal('1000.00'))


class SyncFromMongoTests(TestCase):
    """Tests MongoDB sync command idempotency and privacy hashing."""

    def test_patient_hash_is_salted_sha256(self):
        salt = "secret-test-salt"
        patient_id = "mongo_user_12345"
        expected = hashlib.sha256(f"{salt}:{patient_id}".encode('utf-8')).hexdigest()
        actual = compute_patient_hash(patient_id, salt)
        self.assertEqual(actual, expected)
        self.assertEqual(len(actual), 64)

    @patch('reports.management.commands.sync_from_mongo.MongoClient')
    def test_sync_idempotency_and_dry_run(self, mock_client_cls):
        # Setup mock mongo client with distinct collections
        mock_client = MagicMock()
        mock_db = MagicMock()
        mock_client.get_default_database.return_value = mock_db
        mock_client_cls.return_value = mock_client

        colls = {
            'doctors': MagicMock(),
            'users': MagicMock(),
            'reviews': MagicMock(),
            'appointments': MagicMock(),
        }
        mock_db.__getitem__.side_effect = lambda k: colls.get(k, MagicMock())

        mock_doctors = [
            {
                '_id': 'doc_obj_1',
                'user': 'user_obj_1',
                'specialty': 'Pediatrics',
                'fee': 700.0
            }
        ]
        mock_users = {
            'user_obj_1': {'_id': 'user_obj_1', 'name': 'Dr. Alice Wonder'}
        }
        mock_appts = [
            {
                '_id': 'appt_obj_1',
                'doctor': 'doc_obj_1',
                'patient': 'patient_secret_id',
                'date': '2026-08-20',
                'startTime': '10:00',
                'status': 'completed',
                'payment': {'status': 'paid', 'amount': 700.0},
                'createdAt': datetime(2026, 8, 1, 10, 0),
                'rescheduleCount': 1,
            }
        ]

        colls['doctors'].find.return_value = mock_doctors
        colls['users'].find_one.side_effect = lambda q: mock_users.get(q.get('_id'))
        colls['reviews'].aggregate.return_value = [{'avg_rating': 4.9}]
        colls['appointments'].find.return_value = mock_appts

        # 1. Test Dry Run (no database changes)
        call_command('sync_from_mongo', '--dry-run')
        self.assertEqual(DoctorSnapshot.objects.count(), 0)
        self.assertEqual(AppointmentFact.objects.count(), 0)

        # 2. First Real Run
        call_command('sync_from_mongo')
        self.assertEqual(DoctorSnapshot.objects.count(), 1)
        self.assertEqual(AppointmentFact.objects.count(), 1)

        doctor = DoctorSnapshot.objects.get(mongo_id='doc_obj_1')
        self.assertEqual(doctor.name, 'Dr. Alice Wonder')
        self.assertEqual(doctor.specialization, 'Pediatrics')
        self.assertEqual(doctor.avg_rating, 4.9)

        appt = AppointmentFact.objects.get(mongo_id='appt_obj_1')
        self.assertEqual(appt.status, 'completed')
        self.assertEqual(appt.fee, Decimal('700.00'))
        self.assertEqual(appt.rescheduled_count, 1)
        # Verify privacy: no raw patient id stored
        self.assertNotEqual(appt.patient_hash, 'patient_secret_id')
        self.assertEqual(len(appt.patient_hash), 64)

        # 3. Second Run (Idempotency check - must not duplicate rows)
        # Reset iterator for cursor simulation
        colls['doctors'].find.return_value = mock_doctors
        colls['appointments'].find.return_value = mock_appts
        call_command('sync_from_mongo')
        self.assertEqual(DoctorSnapshot.objects.count(), 1)
        self.assertEqual(AppointmentFact.objects.count(), 1)


class SeedDemoDataTests(TestCase):
    """Tests seed_demo_data command execution and deterministic behavior."""

    def test_seed_demo_data(self):
        call_command('seed_demo_data', count=30, seed=123, clear=True)
        self.assertEqual(AppointmentFact.objects.filter(is_demo=True).count(), 30)
        self.assertGreater(DoctorSnapshot.objects.filter(is_demo=True).count(), 0)

        # Re-running with clear should reset without duplicating
        call_command('seed_demo_data', count=20, seed=123, clear=True)
        self.assertEqual(AppointmentFact.objects.filter(is_demo=True).count(), 20)


class MLModelAndEndpointTests(TestCase):
    """
    Tests for the scikit-learn no-show / cancellation machine learning pipeline
    and the /reports/api/noshow-risk/ JSON scoring endpoint.
    """

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='clinician', password='clinician-pass-123')

    def test_train_pipeline_on_tiny_fixture(self):
        """Validates that ML training completes on a minimal fixture dataset."""
        import pandas as pd
        from ml.train import train_noshow_pipeline

        # Minimal dataset of 20 appointments with both positive and negative outcomes
        data = []
        for i in range(20):
            data.append({
                'mongo_id': f'tiny_appt_{i}',
                'specialization': 'Cardiology' if i % 2 == 0 else 'Pediatrics',
                'patient_hash': f'hash_p_{i % 5}',
                'date': f'2026-08-{(i % 25) + 1:02d}',
                'start_time': f'{(9 + (i % 8)):02d}:00',
                'status': 'cancelled' if i in [3, 7, 11, 15] else 'completed',
                'fee': 600.0,
                'created_at': '2026-08-01T10:00:00+00:00',
                'rescheduled_count': i % 3,
            })
        tiny_df = pd.DataFrame(data)

        report, pipeline = train_noshow_pipeline(df=tiny_df, save_artifacts=False)
        self.assertIn('best_model', report)
        self.assertIn(report['best_model'], ['LogisticRegression', 'RandomForestClassifier'])
        self.assertIn('models', report)
        self.assertIsNotNone(pipeline)

    def test_predict_noshow_probability_output_range(self):
        """Verifies prediction returns a probability strictly between 0 and 1."""
        from ml.predict import predict_noshow_probability

        valid_payload = {
            'weekday': 'Tuesday',
            'hour': 11,
            'lead_time_days': 5,
            'fee': 800.0,
            'specialization': 'Dermatology',
            'patient_prev_cancellations': 0,
            'rescheduled_count': 0
        }

        result = predict_noshow_probability(valid_payload)
        self.assertIn('probability', result)
        self.assertIn('risk_level', result)
        self.assertGreaterEqual(result['probability'], 0.0)
        self.assertLessEqual(result['probability'], 1.0)
        self.assertIn(result['risk_level'], ['Low', 'Medium', 'High'])

    def test_predict_noshow_probability_rejects_invalid_input(self):
        """Verifies validation rejects invalid weekdays, hours, and negative values."""
        from ml.predict import predict_noshow_probability

        # Invalid weekday
        with self.assertRaises(ValueError):
            predict_noshow_probability({
                'weekday': 'Funday', 'hour': 10, 'lead_time_days': 3,
                'fee': 500.0, 'specialization': 'General'
            })

        # Out-of-bounds hour
        with self.assertRaises(ValueError):
            predict_noshow_probability({
                'weekday': 'Monday', 'hour': 45, 'lead_time_days': 3,
                'fee': 500.0, 'specialization': 'General'
            })

        # Negative lead time
        with self.assertRaises(ValueError):
            predict_noshow_probability({
                'weekday': 'Monday', 'hour': 10, 'lead_time_days': -5,
                'fee': 500.0, 'specialization': 'General'
            })

        # Empty specialization
        with self.assertRaises(ValueError):
            predict_noshow_probability({
                'weekday': 'Monday', 'hour': 10, 'lead_time_days': 2,
                'fee': 500.0, 'specialization': ''
            })

    def test_endpoint_requires_login(self):
        """Verifies that the /reports/api/noshow-risk/ endpoint requires authentication."""
        url = reverse('reports:api_noshow_risk')
        response = self.client.post(url, data={}, content_type='application/json')
        self.assertEqual(response.status_code, 302)
        self.assertIn('/accounts/login/', response.url)

    def test_endpoint_rejects_bad_input_with_400(self):
        """Verifies authenticated endpoint returns HTTP 400 on invalid payload."""
        self.client.login(username='clinician', password='clinician-pass-123')
        url = reverse('reports:api_noshow_risk')

        # Empty payload
        res1 = self.client.post(url, data={}, content_type='application/json')
        self.assertEqual(res1.status_code, 400)
        self.assertEqual(res1.json().get('status'), 'error')

        # Invalid hour value
        bad_payload = {
            'weekday': 'Friday',
            'hour': 99,
            'lead_time_days': 2,
            'fee': 700.0,
            'specialization': 'ENT'
        }
        res2 = self.client.post(url, data=bad_payload, content_type='application/json')
        self.assertEqual(res2.status_code, 400)
        self.assertEqual(res2.json().get('status'), 'error')

    def test_endpoint_returns_probability_on_valid_input(self):
        """Verifies authenticated endpoint returns probability between 0 and 1 on valid input."""
        self.client.login(username='clinician', password='clinician-pass-123')
        url = reverse('reports:api_noshow_risk')

        valid_payload = {
            'weekday': 'Wednesday',
            'hour': 15,
            'lead_time_days': 12,
            'fee': 1000.0,
            'specialization': 'Neurology',
            'patient_prev_cancellations': 1,
            'rescheduled_count': 1
        }
        response = self.client.post(url, data=valid_payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'success')
        self.assertIn('probability', data)
        self.assertGreaterEqual(data['probability'], 0.0)
        self.assertLessEqual(data['probability'], 1.0)
        self.assertIn('risk_level', data)
