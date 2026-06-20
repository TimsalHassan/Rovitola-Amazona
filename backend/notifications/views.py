from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PushSubscription
from .serializers import PushSubscriptionSerializer, UnsubscribeSerializer


class VapidPublicKeyView(APIView):
    """
    GET /api/notifications/vapid-public-key/
    Returns the public VAPID key the frontend needs to create a
    PushSubscription via the browser's Push API.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({"public_key": settings.VAPID_PUBLIC_KEY})


class PushSubscribeView(APIView):
    """
    POST /api/notifications/subscribe/
    Body: { "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } }
    Saves (or refreshes) a browser push subscription for the logged-in admin.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = PushSubscriptionSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"status": "subscribed"}, status=status.HTTP_201_CREATED)


class PushUnsubscribeView(APIView):
    """
    POST /api/notifications/unsubscribe/
    Body: { "endpoint": "..." }
    Removes a subscription, e.g. when the admin logs out or disables
    notifications.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = UnsubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        PushSubscription.objects.filter(
            endpoint=serializer.validated_data["endpoint"]
        ).delete()
        return Response({"status": "unsubscribed"})