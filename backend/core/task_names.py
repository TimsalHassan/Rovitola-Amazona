"""
Celery Tasks Registry

This module defines constants for all Celery task names.
Use these constants instead of hardcoding task names.

Example:
    from core.task_names import ORDERS_TASKS
    
    ORDERS_TASKS.send_order_received_email()
"""


class OrdersTasks:
    """Orders module Celery tasks"""
    send_order_received_email = "orders.tasks.send_order_received_email"
    send_restaurant_notification_email = "orders.tasks.send_restaurant_notification_email"


class PaymentsTasks:
    """Payments module Celery tasks"""
    send_payment_notification_email = "payments.tasks.send_payment_notification_email"
    send_payment_failed_email = "payments.tasks.send_payment_failed_email"


class UsersTasks:
    """Users module Celery tasks"""
    send_registration_email = "users.tasks.send_registration_email"
    send_forgot_password_email = "users.tasks.send_forgot_password_email"
    send_password_changed_email = "users.tasks.send_password_changed_email"


class CoreTasks:
    """Core module Celery tasks"""
    debug_task = "core.celery.debug_task"


class NotificationsTasks:
    """Notifications module Celery tasks"""
    create_notification = "notifications.tasks.create_notification"
    send_bulk_notification = "notifications.tasks.send_bulk_notification"
    send_notification_email = "notifications.tasks.send_notification_email"


# Export task collections for easy importing
ORDERS_TASKS = OrdersTasks()
PAYMENTS_TASKS = PaymentsTasks()
USERS_TASKS = UsersTasks()
CORE_TASKS = CoreTasks()
# NOTIFICATIONS_TASKS = NotificationsTasks()

# All tasks in one place
ALL_TASKS = {
    "orders": ORDERS_TASKS,
    "payments": PAYMENTS_TASKS,
    "users": USERS_TASKS,
    "core": CORE_TASKS,
    # "notifications": NOTIFICATIONS_TASKS,
}
