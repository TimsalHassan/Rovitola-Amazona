from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_contact_notification(name, email, phone, subject, message):
    """Restaurant owner ko notification bhejna"""
    send_mail(
        subject=f"New Contact Form Message: {subject}",
        message=f"""You have received a new message from the contact form.

Name: {name}
Email: {email}
Phone: {phone}
Subject: {subject}

Message:
{message}

---
Reply directly to: {email}
""",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.RESTAURANT_EMAIL],
        fail_silently=False,
    )


@shared_task
def send_contact_confirmation(name, email, phone, subject):
    """Customer ko confirmation bhejna"""
    send_mail(
        subject="We received your message — Ravintola Amazona",
        message=f"""Hi {name},

Thank you for contacting us! We have received your message regarding "{subject}".

We will get back to you as soon as possible.

— Ravintola Amazona
""",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )