from django.db import models


class DoctorSnapshot(models.Model):
    """
    Read-only snapshot of Doctor profile synced from MongoDB or demo-seeded.
    """
    mongo_id = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    avg_rating = models.FloatField(default=0.0)
    is_demo = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Doctor Snapshot'
        verbose_name_plural = 'Doctor Snapshots'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.specialization})"


class AppointmentFact(models.Model):
    """
    De-identified fact table for appointments.
    Strict privacy rule: patient_hash is a salted SHA-256 of patient id.
    NO patient names, emails, phones, or medical notes are stored.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no-show', 'No-show'),
    ]

    PAYMENT_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]

    mongo_id = models.CharField(max_length=64, unique=True, db_index=True)
    doctor = models.ForeignKey(
        DoctorSnapshot,
        on_delete=models.CASCADE,
        related_name='appointments',
    )
    patient_hash = models.CharField(max_length=64, db_index=True)
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, db_index=True)
    payment_status = models.CharField(max_length=32, choices=PAYMENT_CHOICES, default='pending')
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(db_index=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    rescheduled_count = models.PositiveIntegerField(default=0)
    is_demo = models.BooleanField(default=False, db_index=True)

    class Meta:
        verbose_name = 'Appointment Fact'
        verbose_name_plural = 'Appointment Facts'
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"Appt {self.mongo_id[:8]} - {self.doctor.name} - {self.date} ({self.status})"
