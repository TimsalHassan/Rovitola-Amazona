from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_order_received_email(order_id, user_email, user_name, order_type, total):
    send_mail(
        subject=f'Order Received – #{order_id}',
        message=f'''
Hi {user_name},

We have received your order #{order_id}!

Order Type : {order_type.upper()}
Total      : €{total}

We are preparing your order now.
Estimated time: 45–60 minutes.

Thank you for ordering from Ravintola Amazona!
— Ravintola Amazona
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_restaurant_notification_email(order_id, order_details):
    send_mail(
        subject=f'🍽️ NEW ORDER – #{order_id}',
        message=f"""
NEW ORDER RECEIVED
==================
{order_details}
==================

Please prepare this order as soon as possible.
— Ravintola Amazona System
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.RESTAURANT_EMAIL],
        fail_silently=False,
    )