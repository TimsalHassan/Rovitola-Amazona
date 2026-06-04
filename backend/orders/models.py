from django.db import models
from django.conf import settings
from .utils import generate_order_number

ORDER_TYPE_CHOICES = [
    ("delivery", "Delivery"),
    ("pickup",   "Pickup"),
]

class Order(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='orders'
    )
    PAYMENT_STATUS = [
        ("unpaid",    "Unpaid"),
        ("paid",      "Paid"),
        ("refunded",  "Refunded"),
    ]
    # Guest fields (used when customer is None)
    guest_name  = models.CharField(max_length=100, blank=True)
    guest_phone = models.CharField(max_length=20, blank=True)
    guest_email = models.EmailField(blank=True)

    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, default="confirmed")
    order_type = models.CharField(
        max_length=10, choices=ORDER_TYPE_CHOICES, default="delivery"
    )
    delivery_address = models.TextField(blank=True)
    order_notes = models.TextField(blank=True)

    # Order class mein add karo
    payment_status   = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="unpaid")
    paytrail_stamp   = models.CharField(max_length=200, blank=True)
    paytrail_tx_id   = models.CharField(max_length=200, blank=True)

    subtotal        = models.DecimalField(max_digits=8, decimal_places=2)
    delivery_charge = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total           = models.DecimalField(max_digits=8, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = generate_order_number()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number

    class Meta:
        ordering = ["-created_at"]

    def get_customer_name(self):
        if self.customer:
            return self.customer.name
        return self.guest_name or "Guest"

    def get_customer_phone(self):
        if self.customer:
            return self.customer.phone
        return self.guest_phone or "N/A"

    def get_customer_email(self):
        if self.customer:
            return self.customer.email
        return self.guest_email or "N/A"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items"
    )
    menu_item_name    = models.CharField(max_length=200)
    menu_item_name_fi = models.CharField(max_length=200, blank=True)
    quantity          = models.IntegerField()
    base_price        = models.DecimalField(max_digits=6, decimal_places=2)
    total_price       = models.DecimalField(max_digits=6, decimal_places=2)
    special_instruction = models.TextField(
        blank=True,
        help_text="e.g. No onions, Extra spicy"
    )

    def __str__(self):
        return f"{self.menu_item_name} x{self.quantity}"


class OrderItemSelectedOption(models.Model):
    """
    Stores each Extra option the customer selected.
    e.g. Size → Large, Toppings → Pepperoni, Toppings → Mushrooms
    """
    order_item     = models.ForeignKey(
        OrderItem, on_delete=models.CASCADE,
        related_name="selected_options"
    )
    extra_name     = models.CharField(max_length=100)   # e.g. "Size"
    extra_name_fi  = models.CharField(max_length=100, blank=True)
    option_name    = models.CharField(max_length=100)   # e.g. "Large"
    option_name_fi = models.CharField(max_length=100, blank=True)
    additional_price = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.extra_name}: {self.option_name} (+€{self.additional_price})"
