from rest_framework import serializers
from .models import Payment, PaymentLog
from orders.models import Order


class PaymentLogSerializer(serializers.ModelSerializer):
    """Serializer for payment logs"""
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    
    class Meta:
        model = PaymentLog
        fields = [
            'id',
            'event_type',
            'event_type_display',
            'message',
            'response_data',
            'created_at',
        ]
        read_only_fields = fields


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    logs = PaymentLogSerializer(many=True, read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'order',
            'order_number',
            'paytrail_stamp',
            'paytrail_reference',
            'paytrail_transaction_id',
            'amount',
            'currency',
            'status',
            'status_display',
            'customer_email',
            'customer_name',
            'created_at',
            'updated_at',
            'paid_at',
            'logs',
        ]
        read_only_fields = [
            'id',
            'paytrail_stamp',
            'created_at',
            'updated_at',
            'paid_at',
            'logs',
        ]


class PaymentDetailSerializer(serializers.ModelSerializer):
    """Detailed payment info for customers"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    order_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'amount',
            'currency',
            'status',
            'status_display',
            'created_at',
            'paid_at',
            'order_details',
        ]
    
    def get_order_details(self, obj):
        if obj.order:
            return {
                'order_number': obj.order.order_number,
                'customer_name': obj.order.get_customer_name(),
                'total': str(obj.order.total),
            }
        return None


class CreatePaymentSerializer(serializers.Serializer):
    """Serializer for initiating payments"""
    order_number = serializers.CharField(max_length=20)
    
    def validate_order_number(self, value):
        try:
            order = Order.objects.get(order_number=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found.")
        
        if order.payment_status == 'paid':
            raise serializers.ValidationError("Order is already paid.")
        
        return value
