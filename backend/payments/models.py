from django.db import models
from django.conf import settings
from orders.models import Order


class Payment(models.Model):
    """Represents a payment transaction with Paytrail"""
    
    PAYMENT_STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='payment',
        null=True,
        blank=True
    )
    
    # Paytrail identifiers
    paytrail_stamp = models.CharField(max_length=200, unique=True, db_index=True)
    paytrail_reference = models.CharField(max_length=200, blank=True)
    paytrail_transaction_id = models.CharField(max_length=200, blank=True, null=True)
    
    # Payment details
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='initiated'
    )
    
    # Customer info
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=200)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['paytrail_stamp']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Payment {self.paytrail_stamp} - {self.status}"
    
    def mark_as_paid(self, transaction_id=None):
        """Mark payment as paid"""
        from django.utils import timezone
        self.status = 'paid'
        self.paid_at = timezone.now()
        if transaction_id:
            self.paytrail_transaction_id = transaction_id
        self.save()
    
    def mark_as_failed(self):
        """Mark payment as failed"""
        self.status = 'failed'
        self.save()


class PaymentLog(models.Model):
    """Log of all payment events and API calls"""
    
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    
    event_type = models.CharField(
        max_length=50,
        choices=[
            ('created', 'Payment Created'),
            ('callback_received', 'Callback Received'),
            ('verified', 'Verified'),
            ('failed', 'Failed'),
            ('error', 'Error'),
            ('refund', 'Refund'),
        ]
    )
    
    message = models.TextField()
    response_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.payment}"

