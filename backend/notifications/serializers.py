from rest_framework import serializers
from .models import Notification, NotificationTemplate


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'notification_type_display',
            'title',
            'message',
            'data',
            'is_read',
            'created_at',
            'read_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'read_at',
        ]


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for notification templates"""
    template_type_display = serializers.CharField(
        source='get_template_type_display',
        read_only=True
    )
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id',
            'name',
            'description',
            'template_type',
            'template_type_display',
            'subject',
            'body',
            'is_active',
        ]
