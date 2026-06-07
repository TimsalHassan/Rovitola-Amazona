from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import ContactMessage
from .serializers import ContactMessageSerializer
from .tasks import send_contact_notification, send_contact_confirmation


class ContactMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        contact = serializer.save()
        send_contact_notification.delay(
            contact.name,
            contact.email,
            contact.phone,
            contact.subject,
            contact.message,
        )

        return Response(
            {"detail": "Your message has been sent successfully. We will get back to you soon."},
            status=status.HTTP_201_CREATED,
        )