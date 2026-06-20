from django.conf import settings
from django.db import models


class PushSubscription(models.Model):
    """
    Stores a browser's Web Push subscription so the backend can send
    notifications (e.g. "New order received") even when the admin doesn't
    have the dashboard tab open — as long as their browser/OS is running.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
        null=True,
        blank=True,
        help_text="Admin user this subscription belongs to.",
    )
    endpoint = models.URLField(max_length=500, unique=True)
    p256dh = models.CharField(max_length=255)
    auth = models.CharField(max_length=255)
    user_agent = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        owner = self.user.email if self.user_id else "unknown"
        return f"PushSubscription({owner})"