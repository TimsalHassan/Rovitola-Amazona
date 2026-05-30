from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ["id", "customer", "customer_name", "rating", "text", "is_approved", "created_at"]
        read_only_fields = ["customer", "is_approved", "created_at"]

    def get_customer_name(self, obj):
        return obj.customer.name


class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["rating", "text"]

    def create(self, validated_data):
        validated_data["customer"] = self.context["request"].user
        return super().create(validated_data)
