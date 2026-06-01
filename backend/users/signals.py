from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .tasks import send_registration_email

User = get_user_model()

@receiver(post_save, sender=User)
def user_registered(sender, instance, created, **kwargs):
    if created:
        send_registration_email.delay(
            user_email=instance.email,
            user_name=instance.first_name or instance.email,
        )