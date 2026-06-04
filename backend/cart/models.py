from django.db import models
from django.conf import settings
from menu.models import MenuItem, ExtraOption


class Cart(models.Model):
    """
    One cart per user (authenticated) or session (guest).
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='cart'
    )
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            # A user can only have one cart
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(user__isnull=False),
                name='unique_cart_per_user'
            )
        ]

    def __str__(self):
        if self.user:
            return f"Cart of {self.user.email}"
        return f"Guest cart ({self.session_key})"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())


class CartItem(models.Model):
    """
    A single line item in the cart.
    Stores snapshot of item name & price so cart stays consistent
    even if menu prices change mid-session.
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(
        MenuItem, on_delete=models.CASCADE, related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    special_instruction = models.TextField(blank=True)

    # Price snapshot at time of adding
    unit_price = models.DecimalField(max_digits=6, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.menu_item.name} x{self.quantity}"

    @property
    def line_total(self):
        extras_total = sum(
            opt.display_price for opt in
            ExtraOption.objects.filter(cart_selections__cart_item=self)
        )
        return (self.unit_price + extras_total) * self.quantity


class CartItemSelectedOption(models.Model):
    """
    Extra options selected for a cart item.
    e.g. Size → Large, Toppings → Pepperoni
    """
    cart_item = models.ForeignKey(
        CartItem, on_delete=models.CASCADE, related_name='selected_options'
    )
    extra_option = models.ForeignKey(
        ExtraOption, on_delete=models.CASCADE, related_name='cart_selections'
    )

    class Meta:
        unique_together = ('cart_item', 'extra_option')

    def __str__(self):
        return f"{self.cart_item} → {self.extra_option}"