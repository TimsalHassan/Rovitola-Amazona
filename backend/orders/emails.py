from django.core.mail import send_mail
from django.conf import settings


def send_order_confirmation(order):
    # logged-in user ya guest dono handle karo
    if order.customer:
        customer_email = order.customer.email
    else:
        customer_email = getattr(order, 'guest_email', None)
    
    if not customer_email:
        return  # email hi nahi hai toh skip

    items_text = ""
    for item in order.items.prefetch_related("selected_options").all():
        items_text += f"\n- {item.menu_item_name} x{item.quantity} = €{item.total_price}"
        for opt in item.selected_options.all():
            price_str = f" (+€{opt.additional_price})" if opt.additional_price > 0 else ""
            items_text += f"\n    • {opt.extra_name}: {opt.option_name}{price_str}"
        if item.special_instruction:
            items_text += f"\n    📝 Note: {item.special_instruction}"

    send_mail(
        subject=f"Order Confirmed – {order.order_number}",
        message=f"""
Your order has been confirmed!

Order Number : {order.order_number}
Status       : Confirmed
Type         : {order.order_type.upper()}

Items:
{items_text}

Subtotal  : €{order.subtotal}
Delivery  : €{order.delivery_charge}
Discount  : -€{order.discount_amount}
Total     : €{order.total}

Estimated delivery: 30–45 minutes
Thank you for ordering from Ravintola Amazona!
        """,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[customer_email],
        fail_silently=True,
    )


def send_restaurant_notification(order):
    items_text = ""
    for item in order.items.prefetch_related("selected_options").all():
        items_text += f"\n- {item.menu_item_name} x{item.quantity}"
        for opt in item.selected_options.all():
            items_text += f"\n    • {opt.extra_name}: {opt.option_name}"
        if item.special_instruction:
            items_text += f"\n    📝 {item.special_instruction}"

    send_mail(
        subject=f"NEW ORDER {order.order_number}",
        message=f"""
NEW ORDER RECEIVED!

Order   : {order.order_number}
Time    : {order.created_at}
Type    : {order.order_type.upper()}

Customer: {order.get_customer_name()}
Phone   : {order.get_customer_phone()}
Address : {order.delivery_address or "Pickup"}

Items:
{items_text}

Notes   : {order.order_notes or "None"}
Total   : €{order.total}
        """,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[settings.RESTAURANT_EMAIL],
        fail_silently=True,
    )
