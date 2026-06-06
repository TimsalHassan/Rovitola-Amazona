from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Notification, NotificationTemplate

User = get_user_model()


class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_notification(self):
        notification = Notification.objects.create(
            user=self.user,
            notification_type='order_confirmed',
            title='Order Confirmed',
            message='Your order has been confirmed'
        )
        self.assertEqual(notification.user, self.user)
        self.assertFalse(notification.is_read)
    
    def test_mark_as_read(self):
        notification = Notification.objects.create(
            user=self.user,
            title='Test',
            message='Test message'
        )
        self.assertFalse(notification.is_read)
        notification.mark_as_read()
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)
