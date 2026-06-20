from rest_framework import serializers

from .models import PushSubscription


class PushSubscriptionSerializer(serializers.Serializer):
    """
    Matches the shape of the browser's PushSubscription.toJSON() output:
    { "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } }
    """
    endpoint = serializers.URLField(max_length=500)
    keys = serializers.DictField(child=serializers.CharField())

    def save(self, **kwargs):
        request = self.context["request"]
        endpoint = self.validated_data["endpoint"]
        keys = self.validated_data["keys"]

        user = request.user if request.user.is_authenticated else None
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:255]

        subscription, _ = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                "p256dh": keys.get("p256dh", ""),
                "auth": keys.get("auth", ""),
                "user": user,
                "user_agent": user_agent,
            },
        )
        return subscription


class UnsubscribeSerializer(serializers.Serializer):
    endpoint = serializers.URLField(max_length=500)