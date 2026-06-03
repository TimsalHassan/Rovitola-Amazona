from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_registration_email(user_email, user_name):
    send_mail(
        subject='Welcome to Ravintola Amazona!',
        message=f'''
Hi {user_name},

Welcome! Your account has been created successfully.

You can now order your favourite food online.

Enjoy your meal!
— Ravintola Amazona
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_forgot_password_email(user_email, user_name, reset_link):
    send_mail(
        subject='Password Reset Request',
        message=f'''
Hi {user_name},

We received a request to reset your password.

Click the link below to reset it:
{reset_link}

This link will expire in 1 hour.

If you did not request this, ignore this email.
— Ravintola Amazona
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_password_changed_email(user_email, user_name):
    send_mail(
        subject='Password Changed Successfully',
        message=f'''
Hi {user_name},

Your password has been changed successfully.

If you did not make this change, contact us immediately.
— Ravintola Amazona
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )