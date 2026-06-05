from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache


class RestaurantSettings(models.Model):
    name = models.CharField(max_length=200, default="Ravintola Amazona")
    address = models.TextField(default="Aleksanterinkatu 3, 15110 Lahti, Finland")
    phone = models.CharField(max_length=20, default="+358037333366")
    phone_2 = models.CharField(max_length=20, blank=True)
    email = models.EmailField(default="info@ravintolaamazona.fi")

    latitude = models.FloatField(default=60.9827)
    longitude = models.FloatField(default=25.6612)

    is_delivery_enabled = models.BooleanField(default=True)
    free_delivery_radius_km = models.PositiveIntegerField(default=9)
    paid_delivery_radius_km = models.PositiveIntegerField(default=14)
    delivery_fee = models.DecimalField(max_digits=5, decimal_places=2, default=4.00)
    min_order = models.DecimalField(max_digits=6, decimal_places=2, default=13.00)

    class Meta:
        verbose_name = "Restaurant Settings"
        verbose_name_plural = "Restaurant Settings"

    def clean(self):
        if not self.pk and RestaurantSettings.objects.exists():
            raise ValidationError("Only one RestaurantSettings instance is allowed.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @classmethod
    def get_settings(cls):
        return cls.objects.first()


class OpeningHours(models.Model):
    DAYS = [
        ('monday',    'Monday'),
        ('tuesday',   'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday',  'Thursday'),
        ('friday',    'Friday'),
        ('saturday',  'Saturday'),
        ('sunday',    'Sunday'),
    ]

    restaurant = models.ForeignKey(
        RestaurantSettings,
        on_delete=models.CASCADE,
        related_name='opening_hours'
    )
    day = models.CharField(max_length=10, choices=DAYS)
    is_closed = models.BooleanField(default=False)
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    lunch_open = models.TimeField(null=True, blank=True)
    lunch_close = models.TimeField(null=True, blank=True)

    class Meta:
        unique_together = ('restaurant', 'day')
        ordering = ['id']

    def __str__(self):
        if self.is_closed:
            return f"{self.day.capitalize()} — Closed"
        return f"{self.day.capitalize()} — {self.open_time} to {self.close_time}"


# ── Signals — admin se kuch bhi update ho toh cache clear ho ──────────────────

@receiver(post_save, sender=RestaurantSettings)
def clear_cache_on_settings_save(sender, **kwargs):
    cache.delete('restaurant_info')


@receiver(post_save, sender=OpeningHours)
def clear_cache_on_hours_save(sender, **kwargs):
    cache.delete('restaurant_info')