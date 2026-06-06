from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


@shared_task
def create_notification(user_id, notification_type, title, message, data=None):
    """Create a notification for a user"""
    from users.models import User
    try:
        user = User.objects.get(id=user_id)
        Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data or {}
        )
    except User.DoesNotExist:
        pass


@shared_task
def send_bulk_notification(user_ids, title, message, notification_type='general'):
    """Send notification to multiple users"""
    from users.models import User
    users = User.objects.filter(id__in=user_ids)
    notifications = [
        Notification(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message
        )
        for user in users
    ]
    Notification.objects.bulk_create(notifications)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_notification_email(self, user_email, subject, message):
    """Send email notification"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)
