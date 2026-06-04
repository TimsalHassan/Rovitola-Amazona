from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "phone"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["name", "email", "phone", "password", "confirm_password"]

    def validate(self, data):
        if len(data["password"]) < 8:
            raise serializers.ValidationError(
                {"password": "Password must be at least 8 characters."}
            )
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "phone", "email"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "New password must be at least 8 characters."
            )
        return value


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "street_address", "city", "postal_code", "country", "is_default", "created_at"]
        read_only_fields = ["id", "created_at"]