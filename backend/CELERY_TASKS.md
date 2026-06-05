# Celery Tasks Documentation

This document lists all Celery tasks available in the Ravintola backend.

## Overview

Celery tasks are asynchronous tasks that run in the background using Redis as the message broker. They are automatically discovered from Django apps.

---

## Orders Tasks

**Location:** `backend/orders/tasks.py`

### 1. `send_order_received_email`
Sends a confirmation email to the customer when their order is placed.

**Task Name:** `orders.tasks.send_order_received_email`

**Parameters:**
- `order_id` (int): The order ID
- `user_email` (str): Customer's email address
- `user_name` (str): Customer's name
- `order_type` (str): Type of order (e.g., "delivery", "pickup")
- `total` (float): Total order amount in euros

**Example Usage:**
```python
send_order_received_email.delay(
    order_id=123,
    user_email="user@example.com",
    user_name="John Doe",
    order_type="delivery",
    total=45.99
)
```

---

### 2. `send_restaurant_notification_email`
Sends a notification email to the restaurant owner when a new order is received.

**Task Name:** `orders.tasks.send_restaurant_notification_email`

**Parameters:**
- `order_id` (int): The order ID
- `order_details` (str): Formatted order details

**Example Usage:**
```python
send_restaurant_notification_email.delay(
    order_id=123,
    order_details="Order details..."
)
```

---

## Payments Tasks

**Location:** `backend/payments/tasks.py`

### 3. `send_payment_notification_email`
Sends a payment confirmation email to the customer.

**Task Name:** `payments.tasks.send_payment_notification_email`

**Parameters:**
- `order_id` (int): The order ID
- `user_email` (str): Customer's email address
- `amount` (float): Payment amount in euros

**Retry Policy:**
- Max retries: 3
- Retry delay: 60 seconds

**Example Usage:**
```python
send_payment_notification_email.delay(
    order_id=123,
    user_email="user@example.com",
    amount=45.99
)
```

---

### 4. `send_payment_failed_email`
Sends a payment failure notification email to the customer.

**Task Name:** `payments.tasks.send_payment_failed_email`

**Parameters:**
- `order_id` (int): The order ID
- `user_email` (str): Customer's email address

**Retry Policy:**
- Max retries: 3
- Retry delay: 60 seconds

**Example Usage:**
```python
send_payment_failed_email.delay(
    order_id=123,
    user_email="user@example.com"
)
```

---

## Users Tasks

**Location:** `backend/users/tasks.py`

### 5. `send_registration_email`
Sends a welcome email to newly registered users.

**Task Name:** `users.tasks.send_registration_email`

**Parameters:**
- `user_email` (str): User's email address
- `user_name` (str): User's name

**Example Usage:**
```python
send_registration_email.delay(
    user_email="user@example.com",
    user_name="John Doe"
)
```

---

### 6. `send_forgot_password_email`
Sends a password reset link to the user's email.

**Task Name:** `users.tasks.send_forgot_password_email`

**Parameters:**
- `user_email` (str): User's email address
- `user_name` (str): User's name
- `reset_link` (str): Password reset link (valid for 1 hour)

**Example Usage:**
```python
send_forgot_password_email.delay(
    user_email="user@example.com",
    user_name="John Doe",
    reset_link="https://example.com/reset/token123"
)
```

---

### 7. `send_password_changed_email`
Sends a confirmation email when the user's password is changed.

**Task Name:** `users.tasks.send_password_changed_email`

**Parameters:**
- `user_email` (str): User's email address
- `user_name` (str): User's name

**Example Usage:**
```python
send_password_changed_email.delay(
    user_email="user@example.com",
    user_name="John Doe"
)
```

---

## Core Tasks

**Location:** `backend/core/celery.py`

### 8. `debug_task`
A debug task for testing Celery functionality.

**Task Name:** `core.celery.debug_task`

**Parameters:** None

**Example Usage:**
```python
debug_task.delay()
```

---

## Task Summary Table

| Task Name | Module | Purpose | Retries |
|-----------|--------|---------|---------|
| send_order_received_email | orders | Customer order confirmation | No |
| send_restaurant_notification_email | orders | Restaurant notification | No |
| send_payment_notification_email | payments | Payment confirmation | 3x |
| send_payment_failed_email | payments | Payment failure notification | 3x |
| send_registration_email | users | Welcome email | No |
| send_forgot_password_email | users | Password reset link | No |
| send_password_changed_email | users | Password change confirmation | No |
| debug_task | core | Debug/testing | No |

---

## Running Celery Worker

To start the Celery worker:

```bash
celery -A core worker --loglevel=info --pool=solo
```

For development with auto-reload:

```bash
celery -A core worker --loglevel=info --pool=solo -l info
```

---

## Monitoring Celery Tasks

View active tasks:
```bash
celery -A core inspect active
```

View registered tasks:
```bash
celery -A core inspect registered
```

View task stats:
```bash
celery -A core inspect stats
```

---

## Configuration

Celery configuration is in `backend/core/settings.py`:

- **Broker:** Redis (configurable via `REDIS_URL`)
- **Result Backend:** Django DB
- **Task Serializer:** JSON
- **Result Expires:** 24 hours
- **Development Mode:** Tasks run synchronously (`CELERY_TASK_ALWAYS_EAGER=True`)
