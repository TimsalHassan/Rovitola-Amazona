from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from menu.models import MenuItem, ExtraOption
from .models import Cart, CartItem, CartItemSelectedOption
from .serializers import (
    CartReadSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
)


def get_or_create_cart(request):
    """
    Returns (cart, created).
    - Authenticated users  → cart tied to user account.
    - Guests               → cart tied to session key.
    """
    if request.user.is_authenticated:
        cart, created = Cart.objects.get_or_create(user=request.user)
        return cart, created

    # Guest: ensure session exists
    if not request.session.session_key:
        request.session.create()

    session_key = request.session.session_key
    cart, created = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart, created


class CartView(APIView):
    """
    GET  /api/cart/        → retrieve cart
    DELETE /api/cart/      → clear entire cart
    """
    permission_classes = [AllowAny]

    def get(self, request):
        cart, _ = get_or_create_cart(request)
        serializer = CartReadSerializer(cart)
        return Response(serializer.data)

    def delete(self, request):
        cart, _ = get_or_create_cart(request)
        cart.items.all().delete()
        return Response({'detail': 'Cart cleared.'}, status=status.HTTP_204_NO_CONTENT)


class AddToCartView(APIView):
    """
    POST /api/cart/add/
    Body: { menu_item_id, quantity, special_instruction?, selected_option_ids? }
    If the same item+options combo already exists → increment quantity.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart, _ = get_or_create_cart(request)
        menu_item = MenuItem.objects.get(id=data['menu_item_id'])
        option_ids = sorted(data.get('selected_option_ids', []))

        # Check if identical item (same menu_item + same options) already in cart
        existing_item = None
        for item in cart.items.prefetch_related('selected_options__extra_option').all():
            if item.menu_item_id != menu_item.id:
                continue
            if item.special_instruction != data.get('special_instruction', ''):
                continue
            existing_option_ids = sorted(
                item.selected_options.values_list('extra_option_id', flat=True)
            )
            if existing_option_ids == option_ids:
                existing_item = item
                break

        if existing_item:
            existing_item.quantity += data['quantity']
            existing_item.save()
            cart_item = existing_item
        else:
            cart_item = CartItem.objects.create(
                cart=cart,
                menu_item=menu_item,
                quantity=data['quantity'],
                unit_price=menu_item.current_price,
                special_instruction=data.get('special_instruction', ''),
            )
            for opt_id in option_ids:
                CartItemSelectedOption.objects.create(
                    cart_item=cart_item,
                    extra_option_id=opt_id,
                )

        # Return updated cart
        cart_serializer = CartReadSerializer(cart)
        return Response(cart_serializer.data, status=status.HTTP_200_OK)


class CartItemView(APIView):
    """
    PATCH  /api/cart/items/<id>/   → update quantity / options
    DELETE /api/cart/items/<id>/   → remove item
    """
    permission_classes = [AllowAny]

    def _get_item(self, request, pk):
        cart, _ = get_or_create_cart(request)
        try:
            return cart.items.get(pk=pk), cart
        except CartItem.DoesNotExist:
            return None, cart

    def patch(self, request, pk):
        cart_item, cart = self._get_item(request, pk)
        if not cart_item:
            return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart_item.quantity = data['quantity']
        if 'special_instruction' in data:
            cart_item.special_instruction = data['special_instruction']
        cart_item.save()

        # Update selected options if provided
        if 'selected_option_ids' in data:
            cart_item.selected_options.all().delete()
            for opt_id in data['selected_option_ids']:
                CartItemSelectedOption.objects.create(
                    cart_item=cart_item,
                    extra_option_id=opt_id,
                )

        cart_serializer = CartReadSerializer(cart)
        return Response(cart_serializer.data)

    def delete(self, request, pk):
        cart_item, cart = self._get_item(request, pk)
        if not cart_item:
            return Response({'detail': 'Item not found.'}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        cart_serializer = CartReadSerializer(cart)
        return Response(cart_serializer.data)


class MergeCartView(APIView):
    """
    POST /api/cart/merge/
    Called after login to merge guest session cart into user cart.
    """

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        session_key = request.session.session_key
        if not session_key:
            return Response({'detail': 'No guest cart found.'}, status=status.HTTP_200_OK)

        try:
            guest_cart = Cart.objects.get(session_key=session_key, user=None)
        except Cart.DoesNotExist:
            return Response({'detail': 'No guest cart found.'}, status=status.HTTP_200_OK)

        user_cart, _ = Cart.objects.get_or_create(user=request.user)

        # Merge guest items into user cart
        for guest_item in guest_cart.items.prefetch_related('selected_options').all():
            option_ids = sorted(
                guest_item.selected_options.values_list('extra_option_id', flat=True)
            )

            # Look for matching item in user cart
            existing = None
            for user_item in user_cart.items.prefetch_related('selected_options').all():
                if user_item.menu_item_id != guest_item.menu_item_id:
                    continue
                if user_item.special_instruction != guest_item.special_instruction:
                    continue
                existing_ids = sorted(
                    user_item.selected_options.values_list('extra_option_id', flat=True)
                )
                if existing_ids == option_ids:
                    existing = user_item
                    break

            if existing:
                existing.quantity += guest_item.quantity
                existing.save()
            else:
                new_item = CartItem.objects.create(
                    cart=user_cart,
                    menu_item=guest_item.menu_item,
                    quantity=guest_item.quantity,
                    unit_price=guest_item.unit_price,
                    special_instruction=guest_item.special_instruction,
                )
                for opt_id in option_ids:
                    CartItemSelectedOption.objects.create(
                        cart_item=new_item,
                        extra_option_id=opt_id,
                    )

        guest_cart.delete()

        cart_serializer = CartReadSerializer(user_cart)
        return Response(cart_serializer.data)