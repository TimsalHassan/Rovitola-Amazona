# Rovintola Restaurant Ordering System - Project Overview

## 1. Project Summary

**Rovintola** (Finnish word for restaurant) is a full-stack restaurant ordering and delivery management system. It enables customers to browse a menu, customize orders with extras (toppings, sizes, sauces), add items to a cart, and checkout with online payment (Paytrail) or cash-on-delivery options. The system supports both **delivery** and **pickup** order types, includes restaurant management features (admin dashboard), order tracking, email notifications, and multi-language support (English & Finnish).

**Target Users:**

- Customers: Browse menu, place orders, track delivery, manage addresses
- Restaurant Staff: Manage orders, update order status, access dashboard
- Admin: Manage menu items, categories, extras, pricing, restaurant settings, reviews, and payments

**Core Purpose:**

- Streamline order management and reduce manual phone orders
- Provide real-time order tracking to customers
- Integrate secure payments via Paytrail
- Manage menu, pricing, and delivery logistics
- Send automated email notifications

---

## 2. Tech Stack

### Backend

- **Language:** Python 3.9+
- **Framework:** Django 6.0.5 + Django REST Framework 3.17.1
- **Database:** PostgreSQL 12+ (production), SQLite (development)
- **Task Queue:** Celery 5.6.3 with Redis broker
- **Email Service:** Resend (via SMTP) + Django email backend
- **Payment Gateway:** Paytrail (Finnish payment processor)
- **File Storage:** Cloudinary (cloud image storage)
- **Cache:** Redis 6.0+
- **API Authentication:** Token-based (DRF Token Auth)
- **Geolocation:** Geopy 2.4.1 + PositionStack API
- **Utilities:** python-decouple (env vars), Pillow (images), BeautifulSoup4 (web scraping)

### Frontend

- **Language:** TypeScript 5.5.3
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.2
- **Routing:** React Router DOM 7.15.1
- **State Management:** React Context API
- **HTTP Client:** Fetch API / Supabase JS SDK 2.57.4
- **Styling:** Tailwind CSS 3.4.1 + PostCSS 8.4.35
- **Icons:** Lucide React 0.344.0
- **Animation:** Motion 12.40.0
- **i18n:** i18next 26.3.0 + react-i18next 17.0.8
- **Dev Tools:** ESLint 9.9.1, TypeScript ESLint

### DevOps / Infrastructure

- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx (reverse proxy, static files)
- **App Server:** Gunicorn 26.0.0
- **Task Scheduler:** Celery Beat (scheduled tasks)

### Key Dependencies Summary

```
Backend: Django, DRF, Celery, Paytrail, Cloudinary, Redis, PostgreSQL
Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, i18next
```

---

## 3. Architecture

### High-Level Architecture

```
┌─────────────────────┐
│   Frontend (React)  │
│   - Pages           │
│   - Components      │
│   - Context API     │
│   - Hooks           │
└──────────┬──────────┘
           │ HTTPS/REST API
           ↓
┌─────────────────────────────────────────┐
│        Backend (Django DRF)             │
│  ┌───────────────────────────────────┐  │
│  │ API Layer (Views, Serializers)    │  │
│  ├───────────────────────────────────┤  │
│  │ Business Logic (Models, Services) │  │
│  ├───────────────────────────────────┤  │
│  │ Database (PostgreSQL)             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Async Tasks (Celery)              │  │
│  │ - Email notifications             │  │
│  │ - Payment callbacks               │  │
│  │ - Scheduled tasks                 │  │
│  └───────────────────────────────────┘  │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    ↓         ↓
  Redis    Cloudinary   Paytrail   Resend
 (Cache)   (Images)   (Payments)  (Email)
```

### Project Structure

#### Backend (`backend/`)

```
backend/
├── core/                    # Django project settings
│   ├── settings.py         # Main configuration (DB, installed apps, middleware)
│   ├── urls.py             # URL routing (api/auth/, api/menu/, etc.)
│   ├── wsgi.py             # WSGI entry point
│   ├── celery.py           # Celery configuration & app initialization
│   ├── task_names.py       # Celery task registry constants
│   └── translation.py      # i18n helpers (Google Translate)
│
├── users/                  # User authentication & profiles
│   ├── models.py           # User (AbstractUser), Address
│   ├── views.py            # Register, Login, Profile, Password reset
│   ├── serializers.py      # User, Address serializers
│   ├── urls.py             # Auth endpoints
│   ├── tasks.py            # Email tasks (verification, password reset)
│   └── migrations/
│
├── menu/                   # Restaurant menu management
│   ├── models.py           # Category, MenuItem, Extra, ExtraOption
│   ├── views.py            # Menu item listing & detail views
│   ├── serializers.py      # Menu serializers
│   ├── urls.py             # Menu API endpoints
│   ├── signals.py          # Auto-translate menu items
│   └── management/
│       └── commands/
│           └── populate_db.py  # Seed database with sample data
│
├── cart/                   # Shopping cart (user & guest)
│   ├── models.py           # Cart, CartItem, CartItemSelectedOption
│   ├── views.py            # Cart CRUD, add to cart, merge guest→user cart
│   ├── serializers.py      # Cart serializers
│   └── urls.py             # Cart endpoints (/api/cart/)
│
├── orders/                 # Order processing & tracking
│   ├── models.py           # Order, OrderItem, OrderItemSelectedOption
│   ├── views.py            # Order creation, listing, status updates, cancellation
│   ├── serializers.py      # Order serializers
│   ├── tasks.py            # Email & notification tasks
│   ├── utils.py            # Helper functions (order number generation)
│   └── urls.py             # Order endpoints (/api/orders/)
│
├── payments/               # Paytrail payment integration
│   ├── models.py           # Payment, PaymentLog
│   ├── views.py            # Payment initiation & callback handling
│   ├── serializers.py      # Payment serializers
│   ├── paytrail.py         # Paytrail API helpers (HMAC signatures, requests)
│   ├── tasks.py            # Payment notification tasks
│   ├── urls.py             # Payment endpoints (/api/payments/)
│   └── migrations/
│
├── reviews/                # Customer reviews & ratings
│   ├── models.py           # Review (1-5 stars, text, approval)
│   ├── views.py            # Review listing, creation
│   ├── serializers.py      # Review serializers
│   └── urls.py             # Review endpoints (/api/reviews/)
│
├── restaurant/             # Restaurant info & settings
│   ├── models.py           # RestaurantSettings, OpeningHours
│   ├── views.py            # Restaurant info, delivery check (distance-based)
│   ├── serializers.py      # Settings serializers
│   ├── utils.py            # Geolocation helpers
│   └── urls.py             # Restaurant endpoints (/api/restaurant/)
│
├── contact/                # Contact form / messages
│   ├── models.py           # ContactMessage
│   ├── views.py            # Message submission
│   ├── serializers.py      # Message serializers
│   ├── tasks.py            # Email notification to admin
│   └── urls.py             # Contact endpoints (/api/contact/)
│
├── admin_api/              # Admin panel API
│   ├── views.py            # Dashboard, user, menu, order, review management
│   ├── serializers.py      # Admin-specific serializers
│   ├── urls.py             # Admin endpoints (/api/admin/)
│   └── permissions.py      # Is staff/superuser checks
│
├── notifications/          # In-app & email notifications (NEW)
│   ├── models.py           # Notification, NotificationTemplate
│   ├── views.py            # Notification API (list, mark as read)
│   ├── tasks.py            # Notification creation & sending
│   └── urls.py
│
├── manage.py               # Django CLI
├── requirements.txt        # Python dependencies
└── db.sqlite3              # Development database
```

#### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── api/
│   │   ├── base.ts         # API client configuration, headers, auth
│   │   ├── auth.ts         # User registration, login, profile
│   │   ├── menu.ts         # Fetch categories, menu items, extras
│   │   ├── cart.ts         # Cart operations (add, remove, fetch)
│   │   ├── order.ts        # Order creation, listing, tracking
│   │   ├── restaurant.ts   # Restaurant info, opening hours, delivery check
│   │   ├── reviews.ts      # Fetch & submit reviews
│   │   └── admin.ts        # Admin dashboard API calls
│   │
│   ├── components/
│   │   ├── Navbar.tsx      # Navigation bar (public pages)
│   │   ├── Footer.tsx      # Footer
│   │   ├── AuthLayout.tsx  # Layout for auth pages (no navbar)
│   │   ├── ProtectedRoute.tsx   # Route guard for authenticated pages
│   │   ├── FormElements.tsx     # Reusable form components
│   │   ├── AddressComponents.tsx # Address form fields
│   │   └── admin/          # Admin-specific components
│   │       ├── AdminLayout.tsx
│   │       ├── AdminRoute.tsx (permission check)
│   │       └── ToastContainer.tsx (notifications)
│   │
│   ├── pages/
│   │   ├── HomePage.tsx        # Menu browsing, featured items
│   │   ├── MenuPage.tsx        # Full menu with filtering
│   │   ├── MenuItemPage.tsx    # Item detail + customization (extras)
│   │   ├── CartPage.tsx        # Shopping cart review
│   │   ├── CheckoutPage.tsx    # Delivery/pickup, payment method selection
│   │   ├── OrderConfirmedPage.tsx   # Order placed confirmation
│   │   ├── OrderConfirmationPage.tsx # Payment confirmation
│   │   ├── OrderTrackingPage.tsx # Real-time order status
│   │   ├── MyOrdersPage.tsx        # Authenticated user order history
│   │   ├── GuestOrdersPage.tsx     # Guest order tracking
│   │   ├── LoginPage.tsx           # User login
│   │   ├── RegisterPage.tsx        # User registration
│   │   ├── VerifyEmailPage.tsx     # Email verification
│   │   ├── ForgotPassword.tsx      # Password recovery
│   │   ├── ResetPassword.tsx       # Reset password with token
│   │   ├── AccountPage.tsx         # User profile & settings
│   │   ├── ContactPage.tsx         # Contact form
│   │   ├── AboutPage.tsx           # About page
│   │   ├── PrivacyPage.tsx         # Privacy policy
│   │   ├── TermsPage.tsx           # Terms of service
│   │   └── admin/
│   │       ├── AdminLoginPage.tsx
│   │       ├── AdminDashboardPage.tsx (stats, quick actions)
│   │       ├── AdminOrdersPage.tsx
│   │       ├── AdminMenuPage.tsx
│   │       ├── AdminMenuFormPage.tsx
│   │       ├── AdminCategoriesPage.tsx
│   │       ├── AdminUsersPage.tsx
│   │       ├── AdminReviewsPage.tsx
│   │       ├── AdminMessagesPage.tsx
│   │       ├── AdminRestaurantPage.tsx
│   │       ├── AdminExtrasPage.tsx
│   │       └── AdminExtraOptionPage.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx           # User auth state (token, user, login/logout)
│   │   ├── CartContext.tsx           # Shopping cart state & operations
│   │   ├── MenuContext.tsx           # Menu items, categories caching
│   │   ├── LanguageContext.tsx       # i18n language (en/fi) switching
│   │   ├── RestaurantContext.tsx     # Restaurant info, settings
│   │   ├── OrderContext.tsx          # Current order state
│   │   └── admin/
│   │       ├── AdminAuthContext.tsx  # Admin login state
│   │       └── ToastContext.tsx      # Toast notifications
│   │
│   ├── hooks/
│   │   └── useToast.ts              # Toast notification hook
│   │
│   ├── types/
│   │   └── (TypeScript interfaces)
│   │
│   ├── utils/
│   │   └── (Helper functions, formatters, validators)
│   │
│   ├── data/
│   │   └── (Hardcoded data, constants, translations)
│   │
│   ├── App.tsx                      # Main router setup
│   ├── main.tsx                     # React entry point
│   ├── index.css                    # Global styles
│   └── vite-env.d.ts                # Vite type declarations
│
├── public/                          # Static assets
├── index.html                       # HTML template
├── vite.config.ts                   # Vite build config
├── tsconfig.json                    # TypeScript config
├── tailwind.config.js               # Tailwind CSS config
├── eslint.config.js                 # ESLint rules
├── package.json                     # npm dependencies
└── Dockerfile                       # Frontend container image
```

---

## 4. Key Modules/Apps

### Backend Apps Overview

| App               | Responsibility                                       | Main Models                               |
| ----------------- | ---------------------------------------------------- | ----------------------------------------- |
| **users**         | User authentication, profiles, addresses             | User, Address                             |
| **menu**          | Menu item catalog, categories, customization options | Category, MenuItem, Extra, ExtraOption    |
| **cart**          | Shopping cart (user & guest sessions)                | Cart, CartItem, CartItemSelectedOption    |
| **orders**        | Order processing, items, tracking, status updates    | Order, OrderItem, OrderItemSelectedOption |
| **payments**      | Paytrail payment integration, transaction logging    | Payment, PaymentLog                       |
| **reviews**       | Customer reviews & ratings (1-5 stars)               | Review                                    |
| **restaurant**    | Restaurant info, opening hours, delivery settings    | RestaurantSettings, OpeningHours          |
| **contact**       | Contact form messages                                | ContactMessage                            |
| **admin_api**     | Admin-only endpoints for dashboard & management      | (Uses existing models)                    |
| **notifications** | In-app & email notifications (NEW)                   | Notification, NotificationTemplate        |

---

## 5. Database Schema Overview

### Entity Relationship Diagram (simplified)

```
User (1) ──── (M) Order
  ↓
  Address (1-M relationship)

User (1) ──── (M) Review
User (1) ──── (1) Cart
  ↓
CartItem (M) ──── (1) MenuItem
  ↓
CartItemSelectedOption (M) ──── (1) ExtraOption

Order (1) ──── (M) OrderItem
  ↓
OrderItem (M) ──── (1) MenuItem
  ↓
OrderItemSelectedOption (M) ──── (1) ExtraOption

Order (1) ──── (1) Payment
  ↓
Payment (1) ──── (M) PaymentLog

Category (1) ──── (M) MenuItem
Category (1) ──── (M) Extra
  ↓
Extra (1) ──── (M) ExtraOption

RestaurantSettings (1) ──── (M) OpeningHours
```

### Key Models & Relationships

**User (Custom)**

- id (PK), email (unique), name, phone, is_email_verified, email_verification_token, password, is_staff, is_superuser

**Address**

- id, user (FK), street_address, city, postal_code, country, is_default, created_at, updated_at

**Category**

- id, name, name_fi, description, description_fi, slug (unique), order, has_deal, deal_label, deal_label_fi

**MenuItem**

- id, category (FK), name, name_fi, description, description_fi, base_price, sale_price, image (Cloudinary), is_available, is_menu_item, is_lunch_item, created_at

**Extra** (customization groups)

- id, category (FK), name, name_fi, extra_type (choice/extra), order, is_required, max_selections

**ExtraOption** (individual options)

- id, extra (FK), name, name_fi, additional_price

**Cart (session-based or user)**

- id, user (FK, nullable), session_key, created_at, updated_at

**CartItem**

- id, cart (FK), menu_item (FK), quantity, special_instruction, unit_price

**CartItemSelectedOption**

- id, cart_item (FK), extra_option (FK)

**Order**

- id, order_number (unique), customer (FK, nullable), status, order_type (delivery/pickup), delivery_address
- guest_name, guest_phone, guest_email (for guest orders)
- payment_status, payment_method (online/cash_on_delivery/cash_on_pickup)
- paytrail_stamp, paytrail_tx_id
- subtotal, delivery_charge, discount_amount, total
- created_at, updated_at

**OrderItem**

- id, order (FK), menu_item_name, menu_item_name_fi, quantity, base_price, total_price, special_instruction

**OrderItemSelectedOption**

- id, order_item (FK), extra_name, extra_name_fi, option_name, option_name_fi, additional_price

**Payment**

- id, order (OneToOneFK), paytrail_stamp (unique, indexed), paytrail_reference, paytrail_transaction_id
- amount, currency (EUR), status, customer_email, customer_name
- created_at, updated_at, paid_at

**PaymentLog**

- id, payment (FK), event_type (created, callback_received, verified, failed, error, refund)
- message, response_data (JSON), created_at

**Review**

- id, customer (FK), rating (1-5), text, is_approved, created_at

**RestaurantSettings**

- id, name, address, phone, phone_2, email
- latitude, longitude
- is_delivery_enabled, free_delivery_radius_km, paid_delivery_radius_km, delivery_fee, min_order

**OpeningHours**

- id, restaurant (FK), day (mon-sun), is_closed, open_time, close_time, lunch_open, lunch_close

**Notification**

- id, user (FK), notification_type, title, message, data (JSON), is_read, created_at, updated_at, read_at

**NotificationTemplate**

- id, name (unique), description, template_type (email/sms/push/in_app), subject, body, is_active

---

## 6. API Endpoints

### Authentication Endpoints (`/api/auth/`)

```
POST   /register/              → Create account + send verification email
POST   /login/                 → Login with email/password, return token
POST   /logout/                → Logout (delete token)
GET    /profile/               → Get current user profile [Authenticated]
PUT    /profile/               → Update profile [Authenticated]
POST   /change-password/       → Change password [Authenticated]
POST   /forgot-password/       → Request password reset (send email)
POST   /reset-password/        → Reset password with token
GET    /verify-email/<token>/  → Verify email with token
POST   /resend-verification/   → Resend verification email
GET    /addresses/             → List user addresses [Authenticated]
POST   /addresses/             → Create address [Authenticated]
PUT    /addresses/<id>/        → Update address [Authenticated]
DELETE /addresses/<id>/        → Delete address [Authenticated]
```

### Menu Endpoints (`/api/menu/`)

```
GET    /categories/            → List all menu categories
GET    /items/                 → List all menu items (paginated)
GET    /items/<id>/            → Get menu item detail with extras
GET    /extras/                → List extras for category (query: ?category_id=)
GET    /extra-options/         → List extra options (query: ?extra_id=)
```

### Cart Endpoints (`/api/cart/`)

```
GET    /                       → Get user/session cart
POST   /add/                   → Add item to cart with extras
PUT    /items/<id>/            → Update cart item quantity
DELETE /items/<id>/            → Remove item from cart
POST   /merge/                 → Merge guest cart into user cart [Authenticated]
```

### Order Endpoints (`/api/orders/`)

```
GET    /                       → List user orders [Authenticated] or all [public]
POST   /create/                → Create new order (guest or authenticated)
GET    /<order_number>/        → Get order details (public, show guest orders)
PUT    /<order_number>/status/ → Update order status [Admin]
POST   /<order_number>/cancel/ → Cancel order
```

### Payment Endpoints (`/api/payments/`)

```
POST   /<order_number>/initiate/   → Start Paytrail payment, return payment URL
GET    /callback/success/          → Paytrail success redirect
GET    /callback/cancel/           → Paytrail cancel redirect
```

### Reviews Endpoints (`/api/reviews/`)

```
GET    /                       → List approved reviews
POST   /create/                → Submit review [Authenticated]
```

### Restaurant Endpoints (`/api/restaurant/`)

```
GET    /info/                  → Get restaurant info, opening hours
POST   /delivery-check/        → Check if delivery available (address → distance)
```

### Contact Endpoints (`/api/contact/`)

```
POST   /                       → Submit contact message
```

### Admin Endpoints (`/api/admin/`)

```
GET    /stats/                 → Dashboard stats [Admin]
GET    /users/                 → List all users [Admin]
GET    /users/<id>/            → User detail [Admin]
GET    /categories/            → List categories [Admin]
POST   /categories/            → Create category [Admin]
PUT    /categories/<id>/       → Update category [Admin]
DELETE /categories/<id>/       → Delete category [Admin]
GET    /menu-items/            → List menu items [Admin]
POST   /menu-items/            → Create menu item [Admin]
PUT    /menu-items/<id>/       → Update menu item [Admin]
DELETE /menu-items/<id>/       → Delete menu item [Admin]
POST   /menu-items/<id>/toggle/ → Toggle item availability [Admin]
GET    /extras/                → List extras [Admin]
POST   /extras/                → Create extra [Admin]
PUT    /extras/<id>/           → Update extra [Admin]
GET    /extras/<id>/options/   → List extra options [Admin]
POST   /extras/<id>/options/   → Create extra option [Admin]
PUT    /extras/<id>/options/<id>/ → Update extra option [Admin]
GET    /orders/                → List orders [Admin]
GET    /orders/<order_number>/ → Order detail [Admin]
PUT    /orders/<order_number>/status/ → Update order status [Admin]
GET    /reviews/               → List reviews [Admin]
PUT    /reviews/<id>/          → Approve/reject review [Admin]
GET    /messages/              → List contact messages [Admin]
GET    /messages/<id>/         → Message detail [Admin]
GET    /restaurant/            → Get restaurant settings [Admin]
PUT    /restaurant/            → Update settings [Admin]
POST   /restaurant/hours/bulk-update/ → Bulk update opening hours [Admin]
```

---

## 7. Authentication & Permissions

### Authentication Method

- **Token-based Authentication** (DRF Token Auth)
- Users receive an API token on login, sent in `Authorization: Token <token>` header
- Tokens persist until logout or deletion

### Authorization Model

```
Permission Levels:
├── Anonymous (public) → Browse menu, submit contact, view reviews, place guest orders
├── Authenticated User → Place orders, manage cart, profile, addresses, track orders
└── Admin/Staff → Access admin API, manage menu, orders, users, restaurant settings
```

### Protected Routes

- `/account/` - Requires authentication
- `/checkout/` - Requires valid cart, allows guest checkout
- `/admin/*` - Requires admin/staff role
- `/api/admin/*` - Requires `is_staff=True` or `is_superuser=True`

### Guest Checkout

- Customers can place orders **without authentication**
- Guest orders identified by email, phone number
- Orders tracked via order number + email lookup
- Session-based cart for guests (merged if user later authenticates)

### Role-Based Access

| Role                | Capabilities                                                                           |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Anonymous**       | Browse menu, contact form, submit reviews (with email), guest checkout, order tracking |
| **User**            | All anonymous + user account, saved addresses, order history, email verification       |
| **Staff**           | All user + admin panel (limited — order management, review approval)                   |
| **Admin/Superuser** | Full admin access — all management, settings, user management                          |

---

## 8. Environment & Setup

### Required Environment Variables (`.env`)

```bash
# Django Core
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Database (PostgreSQL)
DB_NAME=ravintola_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Frontend URL
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Redis (Cache & Celery Broker)
REDIS_URL=redis://127.0.0.1:6379/1

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Resend)
RESEND_API_KEY=your-resend-key
DEFAULT_FROM_EMAIL=noreply@ravintolaamazona.fi
RESTAURANT_EMAIL=info@ravintolaamazona.fi

# Payment (Paytrail)
PAYTRAIL_ACCOUNT=375917
PAYTRAIL_SECRET=SAIPPUAKAUPPIAS

# Geolocation (PositionStack)
POSITIONSTACK_API_KEY=your-api-key
```

### Installation & Setup

#### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file
cp .env.example .env
# Edit .env with your configuration

# 4. Run migrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. (Optional) Load sample data
python manage.py populate_db

# 7. Run development server
python manage.py runserver
# Access: http://localhost:8000
# Admin: http://localhost:8000/manage/

# 8. (Separate terminal) Run Celery worker for async tasks
celery -A core worker --loglevel=info

# 9. (Separate terminal) Run Celery Beat for scheduled tasks
celery -A core beat --loglevel=info
```

#### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file (if needed)
# VITE_API_URL=http://localhost:8000

# 3. Run development server
npm run dev
# Access: http://localhost:5173

# 4. Build for production
npm run build

# 5. Preview production build
npm preview
```

#### Docker Setup (Combined)

```bash
docker-compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

### Database Migrations

```bash
# Create migration (after model changes)
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations
```

### Running Tests

```bash
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test orders

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

---

## 9. Notable Features

### 1. **Flexible Menu Customization**

- **Extras System**: Categories can have customization groups (e.g., "Size", "Toppings")
- **Single/Multiple Selection**: Extra type `choice` (radio) vs `extra` (checkbox)
- **Required Extras**: Mark extras as required before adding to cart
- **Dynamic Pricing**: Each option can add cost to base price
- **Max Selections**: Limit number of toppings per item (e.g., max 3 toppings)

### 2. **Bi-Lingual Support** (English & Finnish)

- Automatic translation using Google Translate API on model save
- Fields: `name`, `name_fi`, `description`, `description_fi`, etc.
- Frontend i18n via i18next + react-i18next
- Locale paths: `backend/locale/` for Django translations

### 3. **Smart Order Pricing**

```
Total = (Item Price + Selected Extras) × Quantity + Delivery Fee - Discount
```

- Base price & sale price (overrides base if set)
- Extra options add surcharges dynamically
- Delivery fee: Free up to 9km, €4 for 9-14km, unavailable beyond 14km
- Minimum order requirement: €13.00

### 4. **Paytrail Payment Integration**

- HMAC-SHA256 signature verification for security
- Request → Paytrail → Redirect to success/cancel callback
- Callback URL handling with browser + server-to-server support
- Payment status: initiated → paid/failed/cancelled/refunded
- Order status auto-updated on successful payment
- Fallback to cash-on-delivery if payment fails

### 5. **Order Status Workflow**

```
Guest Order Flow:
1. pending (created) → confirmed (paid) → preparing → ready_for_pickup → completed
2. pending → cancelled (by guest)

Delivery Order Flow:
1. pending → confirmed → preparing → on_the_way → delivered → completed
2. pending → cancelled

Admin can update status at any step
```

### 6. **Async Email Notifications** (Celery Tasks)

- Order confirmation email (to customer + restaurant)
- Password reset email
- Email verification on registration
- Contact message notification to admin
- All via Resend SMTP

### 7. **Guest vs. Authenticated Orders**

- Guest: Email-based tracking, no account needed, cart is session-based
- User: Full profile, saved addresses, order history, email verification
- Cart merge: When guest logs in, their session cart merges into user cart

### 8. **Geolocation & Delivery Checking**

- Restaurant coordinates (latitude/longitude) stored
- Delivery check via Geopy: customer address → calculate distance
- Free/paid delivery zones: 0-9km free, 9-14km €4, beyond unavailable
- Uses PositionStack API for address → coordinates conversion

### 9. **Restaurant Settings & Hours**

- Single RestaurantSettings instance (singleton pattern)
- Per-day opening hours (mon-sun): open_time, close_time
- Lunch special times: lunch_open, lunch_close
- Delivery radius & fees configurable via admin
- Cache invalidation on settings save (signals)

### 10. **Review Moderation**

- Customers can submit 1-5 star reviews + text
- Reviews require approval by admin (is_approved flag)
- Only approved reviews displayed on public site
- Admin dashboard shows pending reviews

### 11. **Admin Dashboard**

- **Stats**: Total orders, revenue, pending orders, recent activity
- **Order Management**: List, detail, status updates, cancellation
- **Menu Management**: Add/edit/delete categories, items, extras
- **User Management**: View user list, profiles
- **Review Moderation**: Approve/reject pending reviews
- **Contact Messages**: View customer inquiries
- **Restaurant Settings**: Configure hours, delivery, contact info
- **Bulk Operations**: Bulk update opening hours

### 12. **Multi-Language Admin**

- Django admin interface supports i18n
- Menu items auto-translate on save
- Finnish locale support configured

---

## 10. Known TODOs / Improvement Areas

### Backend TODOs (Scanned from code)

- None explicitly marked with TODO/FIXME comments found, but potential improvements:
  1. **Payment Refunds**: PaymentLog has refund event type but no refund logic implemented
  2. **Email Delivery**: Currently uses Resend; fallback on failure not implemented
  3. **Order History Cleanup**: No archival/cleanup for old orders
  4. **Rate Limiting**: API endpoints lack rate limiting (could add django-ratelimit)
  5. **Logging & Monitoring**: Basic logging; could improve Sentry integration
  6. **Order Notifications**: SMS notifications not implemented (only email)
  7. **Discount Codes**: No promo/discount code system yet
  8. **Inventory Management**: No stock tracking for menu items
  9. **Analytics**: No order analytics/reporting system

### Frontend TODOs

- None explicitly marked, but potential improvements:
  1. **Payment UI**: Payment form not fully integrated with Paytrail checkout
  2. **Real-time Updates**: No WebSocket for live order status (polling used instead)
  3. **Image Optimization**: Cloudinary URLs could use transformation parameters
  4. **Offline Support**: No PWA/offline cart persistence
  5. **Order Search**: Admin order search/filtering could be improved
  6. **Mobile Responsive**: Some admin pages may need mobile optimization
  7. **Loading States**: Could add skeleton loaders for better UX
  8. **Error Boundaries**: React error boundaries not fully implemented

### Infrastructure TODOs

1. **Celery Monitoring**: No Flower/monitoring dashboard for Celery
2. **CI/CD**: No GitHub Actions/GitLab CI configured
3. **Database Backups**: No automated backup strategy documented
4. **SSL/TLS**: HTTPS not configured for local dev (needed for Paytrail in prod)
5. **Docker Optimization**: Could use multi-stage builds, smaller base images

### Feature Completeness

- ✅ Backend: ~95% complete (payments, notifications, admin all working)
- ✅ Frontend: ~80% complete (most pages done, some admin features in progress)
- ⏳ Integration: Payment flow tested, email delivery tested, needs E2E testing
- ⏳ Deployment: Docker-Compose ready, but prod deployment untested

---

## 11. Key File References

### Important Backend Files

- **Core Config**: [backend/core/settings.py](backend/core/settings.py)
- **Main Routes**: [backend/core/urls.py](backend/core/urls.py)
- **User Model**: [backend/users/models.py](backend/users/models.py)
- **Order Model**: [backend/orders/models.py](backend/orders/models.py)
- **Menu Model**: [backend/menu/models.py](backend/menu/models.py)
- **Payment Logic**: [backend/payments/paytrail.py](backend/payments/paytrail.py)
- **Celery Config**: [backend/core/celery.py](backend/core/celery.py)
- **Task Registry**: [backend/core/task_names.py](backend/core/task_names.py)

### Important Frontend Files

- **Main App**: [frontend/src/App.tsx](frontend/src/App.tsx)
- **Auth API**: [frontend/src/api/auth.ts](frontend/src/api/auth.ts)
- **Menu API**: [frontend/src/api/menu.ts](frontend/src/api/menu.ts)
- **Auth Context**: [frontend/src/context/AuthContext.tsx](frontend/src/context/AuthContext.tsx)
- **Cart Context**: [frontend/src/context/CartContext.tsx](frontend/src/context/CartContext.tsx)

### Configuration Files

- **Backend Requirements**: [backend/requirements.txt](backend/requirements.txt)
- **Frontend Dependencies**: [frontend/package.json](frontend/package.json)
- **Docker Compose**: [docker-compose.yaml](docker-compose.yaml)
- **Tailwind Config**: [frontend/tailwind.config.js](frontend/tailwind.config.js)
- **Vite Config**: [frontend/vite.config.ts](frontend/vite.config.ts)

---

## 12. Getting Help

### Documentation Files

- [backend/README.md](backend/README.md) — Backend setup & API reference
- [backend/BACKEND_COMPLETION.md](backend/BACKEND_COMPLETION.md) — Completed tasks
- [backend/CELERY_TASKS.md](backend/CELERY_TASKS.md) — Celery task documentation

### Common Commands

#### Backend

```bash
python manage.py shell                    # Django interactive shell
python manage.py dbshell                  # Database interactive shell
python manage.py createsuperuser          # Create admin user
python manage.py populate_db              # Load sample data
python manage.py makemigrations           # Create migrations
python manage.py migrate                  # Apply migrations
python manage.py collectstatic            # Collect static files
celery -A core worker -l info             # Run Celery worker
celery -A core beat -l info               # Run Celery Beat scheduler
```

#### Frontend

```bash
npm run dev                               # Start dev server
npm run build                             # Build for production
npm run lint                              # Run ESLint
npm run typecheck                         # Check TypeScript
npm preview                               # Preview production build
```

#### Docker

```bash
docker-compose up                         # Start all services
docker-compose logs -f backend            # Follow backend logs
docker-compose logs -f frontend           # Follow frontend logs
docker-compose down                       # Stop all services
```

---

## 13. Project Statistics

| Metric              | Count                            |
| ------------------- | -------------------------------- |
| Backend Apps        | 10                               |
| Django Models       | 30+                              |
| API Endpoints       | 50+                              |
| Frontend Pages      | 25+                              |
| React Components    | 15+                              |
| Context Providers   | 6                                |
| Celery Tasks        | 11                               |
| Supported Languages | 2 (English, Finnish)             |
| Database Tables     | 30+                              |
| Test Files          | Each app has tests.py            |
| Docker Services     | 4 (Backend, Frontend, DB, Redis) |

---

## 14. Quick Links

- **Frontend**: http://localhost:5173 (dev)
- **Backend API**: http://localhost:8000 (dev)
- **Django Admin**: http://localhost:8000/manage/ (dev)
- **Redis**: localhost:6379 (dev)
- **PostgreSQL**: localhost:5432 (dev)
- **Nginx**: http://localhost:80 (docker production)

---

**Generated:** June 13, 2026  
**Project Status:** Beta (Backend 95% complete, Frontend 80% complete, Integration testing in progress)
