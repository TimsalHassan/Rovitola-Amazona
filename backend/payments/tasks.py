# from celery import shared_task
# from django.core.mail import send_mail
# from django.conf import settings


# @shared_task(bind=True, max_retries=3, default_retry_delay=60)
# def send_payment_notification_email(self, order_id, user_email, amount):
#     try:
#         send_mail(
#             subject=f"Payment Confirmed – Order #{order_id}",
#             message=(
#                 f"Hi,\n\n"
#                 f"Your payment of €{amount} for order #{order_id} has been received.\n"
#                 f"We are now preparing your order.\n\n"
#                 f"Thank you!\n"
#                 f"— Ravintola Amazona"
#             ),
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[user_email],
#             fail_silently=False,
#         )
#     except Exception as exc:
#         raise self.retry(exc=exc)


# @shared_task(bind=True, max_retries=3, default_retry_delay=60)
# def send_payment_failed_email(self, order_id, user_email):
#     try:
#         send_mail(
#             subject=f"Payment Failed – Order #{order_id}",
#             message=(
#                 f"Hi,\n\n"
#                 f"Unfortunately your payment for order #{order_id} was not completed.\n"
#                 f"Please try again or contact us if you need help.\n\n"
#                 f"— Ravintola Amazona"
#             ),
#             from_email=settings.DEFAULT_FROM_EMAIL,
#             recipient_list=[user_email],
#             fail_silently=False,
#         )
#     except Exception as exc:
#         raise self.retry(exc=exc)