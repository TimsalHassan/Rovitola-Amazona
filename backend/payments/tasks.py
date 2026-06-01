from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_payment_notification_email(order_id, user_email, amount):
    send_mail(
        subject=f'Payment Received – #{order_id}',
        message=f'''
Your payment of €{amount} for order #{order_id} has been received.

Thank you!
— Ravintola Amazona
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_payment_failed_email(order_id, user_email):
    send_mail(
        subject=f'Payment Failed – #{order_id}',
        message=f'''
Your payment for order #{order_id} failed.
Please try again or contact us.

— Ravintola Amazona
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )