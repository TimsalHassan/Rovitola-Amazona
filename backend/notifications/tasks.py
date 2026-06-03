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
def send_order_confirmation_email(order_id, user_email, user_name, items_text, total):
    send_mail(
        subject=f'Order Confirmed – #{order_id}',
        message=f'''
Hi {user_name},

Your order #{order_id} has been confirmed!

Items:
{items_text}

Total: €{total}

Estimated delivery: 45–60 minutes
Thank you for ordering from Ravintola Amazona!
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_order_preparing_email(order_id, user_email, user_name):
    send_mail(
        subject=f'Order Being Prepared – #{order_id}',
        message=f'''
Hi {user_name},

Great news! Your order #{order_id} is now being prepared.

Estimated delivery: 45–60 minutes.
— Ravintola Amazona
        ''',
        from_email='Ravintola Amazona <orders@timsalhassan.me>',
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_order_on_the_way_email(order_id, user_email, user_name):
    send_mail(
        subject=f'Order On The Way – #{order_id}',
        message=f'''
Hi {user_name},

Your order #{order_id} is on the way!

Estimated arrival: 30–45 minutes.
— Ravintola Amazona
        ''',
        from_email='Ravintola Amazona <orders@timsalhassan.me>',
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_order_shipped_email(order_id, user_email, user_name):
    send_mail(
        subject=f'Order Delivered – #{order_id}',
        message=f'''
Hi {user_name},

Your order #{order_id} has been delivered!

Thank you for ordering from Ravintola Amazona. Enjoy your meal! 🍕
— Ravintola Amazona
        ''',
        from_email='Ravintola Amazona <orders@timsalhassan.me>',
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_order_cancelled_email(order_id, user_email, user_name):
    send_mail(
        subject=f'Order Cancelled – #{order_id}',
        message=f'''
Hi {user_name},

Unfortunately your order #{order_id} has been cancelled.

If you have any questions, please contact us.
— Ravintola Amazona
        ''',
        from_email='Ravintola Amazona <orders@timsalhassan.me>',
        recipient_list=[user_email],
        fail_silently=False,
    )

@shared_task
def send_restaurant_notification_email(order_id, order_details):
    send_mail(
        subject=f'NEW ORDER – #{order_id}',
        message=order_details,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.RESTAURANT_EMAIL],
        fail_silently=False,
    )