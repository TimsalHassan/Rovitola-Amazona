# Ravintola Backend

A Django REST API backend for the Ravintola restaurant ordering system with real-time payments, notifications, and order management.

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- Redis 6.0+
- pip or conda

### Installation

1. **Clone and setup virtual environment:**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Create `.env` file from example:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run migrations:**

```bash
python manage.py migrate
```

5. **Create superuser:**

```bash
python manage.py createsuperuser
```

6. **Run development server:**

```bash
python manage.py runserver
```

Visit `http://localhost:8000/admin` to access the Django admin panel.

---

## 📦 Project Structure

```
backend/
├── core/                  # Django project settings & configuration
│   ├── settings.py       # Main settings
│   ├── urls.py           # URL routing
│   ├── wsgi.py           # WSGI configuration
│   ├── celery.py         # Celery configuration
│   └── task_names.py     # Celery task registry
│
├── users/                # User authentication & profiles
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── tasks.py          # Email sending tasks
│
├── menu/                 # Restaurant menu management
│   ├── models.py         # Categories, menu items, pricing
│   ├── views.py
│   ├── serializers.py
│   ├── signals.py
│   └── management/commands/
│       └── populate_db.py
│
├── cart/                 # Shopping cart management
│   ├── models.py
│   ├── views.py
│   └── serializers.py
│
├── orders/               # Order processing
│   ├── models.py         # Order, OrderItem models
│   ├── views.py
│   ├── serializers.py
│   ├── tasks.py          # Order email tasks
│   └── utils.py          # Order utilities
│
├── payments/             # Payment processing with Paytrail
│   ├── models.py         # Payment, PaymentLog models
│   ├── views.py
│   ├── serializers.py    # NEW: Payment serializers
│   ├── tasks.py          # Payment email tasks
│   ├── paytrail.py       # Paytrail integration
│   └── utils.py
│
├── notifications/        # NEW: User notifications system
│   ├── models.py         # Notification, NotificationTemplate
│   ├── views.py          # Notification API views
│   ├── serializers.py    # Notification serializers
│   ├── tasks.py          # Notification tasks
│   └── admin.py
│
├── reviews/              # Customer reviews & ratings
│   ├── models.py
│   ├── views.py
│   └── serializers.py
│
├── restaurant/           # Restaurant information
│   ├── models.py
│   ├── views.py
│   └── serializers.py
│
└── db.sqlite3            # Development database
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# Django
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=rovintola
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://127.0.0.1:6379/1

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESTAURANT_EMAIL=owner@restaurant.com

# Payments (Paytrail)
PAYTRAIL_ACCOUNT=375917
PAYTRAIL_SECRET=SAIPPUAKAUPPIAS
```

---

## 🗄️ Database Models

### Users
- Custom User model with email authentication
- User profiles with address information

### Menu
- Categories (appetizers, mains, desserts, etc.)
- Menu items with pricing and descriptions
- Pricing tiers (dine-in, delivery, etc.)

### Orders
- Order creation and tracking
- Order items with selected options
- Order status: pending → confirmed → preparing → ready → delivered
- Payment integration with Paytrail

### Payments
- **Payment** - Payment transaction records
- **PaymentLog** - Audit log of payment events
- Integration with Paytrail payment gateway

### Notifications (NEW)
- **Notification** - User notifications (orders, payments, promotions)
- **NotificationTemplate** - Email/SMS/Push templates

---

## 📧 Celery Tasks

### Registered Tasks

**Orders:**
- `send_order_received_email` - Customer order confirmation
- `send_restaurant_notification_email` - Restaurant notification

**Payments:**
- `send_payment_notification_email` - Payment confirmation
- `send_payment_failed_email` - Payment failure notification

**Users:**
- `send_registration_email` - Welcome email
- `send_forgot_password_email` - Password reset link
- `send_password_changed_email` - Password change confirmation

**Notifications (NEW):**
- `create_notification` - Create user notification
- `send_bulk_notification` - Send to multiple users
- `send_notification_email` - Email notification

### Running Celery Worker

```bash
# Development (synchronous execution)
# Tasks run immediately in DEBUG=True mode

# Production (with Redis broker)
celery -A core worker --loglevel=info --pool=solo
```

### Monitoring Celery

```bash
# View active tasks
celery -A core inspect active

# View registered tasks
celery -A core inspect registered

# View task stats
celery -A core inspect stats
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `POST /api/auth/refresh/` - Refresh token

### Menu
- `GET /api/menu/items/` - Get all menu items
- `GET /api/menu/categories/` - Get categories
- `GET /api/menu/items/{id}/` - Get item details

### Orders
- `POST /api/orders/` - Create order
- `GET /api/orders/` - Get user orders
- `GET /api/orders/{id}/` - Get order details
- `PATCH /api/orders/{id}/` - Update order

### Payments
- `POST /api/payments/{order_number}/initiate/` - Initiate payment
- `GET /api/payments/callback/success/` - Payment success callback
- `GET /api/payments/callback/cancel/` - Payment cancel callback

### Notifications (NEW)
- `GET /api/notifications/` - Get all notifications
- `GET /api/notifications/unread/` - Get unread notifications
- `GET /api/notifications/unread_count/` - Get unread count
- `POST /api/notifications/{id}/mark_as_read/` - Mark as read
- `POST /api/notifications/mark_all_as_read/` - Mark all as read

---

## 🧪 Testing

Run tests for all apps:

```bash
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test orders
python manage.py test payments
python manage.py test notifications
```

---

## 🔒 Security

- Token-based authentication (DRF Token)
- CORS configuration for frontend
- SQL injection prevention (Django ORM)
- CSRF protection
- Password hashing with Django's default algorithm

---

## 🚀 Production Deployment

### Pre-deployment checklist

1. Set `DEBUG=False` in `.env`
2. Generate strong `SECRET_KEY`
3. Configure allowed hosts
4. Use PostgreSQL database
5. Set up Redis for caching & Celery
6. Configure email backend (Resend)
7. Set up logging
8. Enable HTTPS

### Docker Deployment (Coming Soon)

```bash
docker-compose up -d
```

---

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryproject.io/)
- [Paytrail Integration Guide](https://docs.paytrail.com/)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

---

## 📝 License

This project is proprietary and confidential.

---

## 🆘 Support

For issues or questions, contact the development team.

---

## ✅ Recent Updates

- ✨ **NEW:** Complete notifications system with models, views, and tasks
- ✨ **NEW:** Payment models and serializers for transaction tracking
- ✨ **NEW:** Celery task registry in `core/task_names.py`
- 📝 **NEW:** Comprehensive API documentation in `CELERY_TASKS.md`
- 🔧 **FIXED:** Order confirmation email integration with Celery tasks
