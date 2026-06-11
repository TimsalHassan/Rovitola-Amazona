from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

from users.tasks import _wrap_email, _greeting, _body_text, _divider, _signature


# ── Helpers ───────────────────────────────────────────────────────────────────

def _order_type_badge(order_type: str) -> str:
    label = order_type.upper()
    if label == "DELIVERY":
        icon, bg, border, text = "🚗", "#fef3c7", "#fde68a", "#92400e"
    elif label == "TAKEAWAY":
        icon, bg, border, text = "🥡", "#fff7ed", "#fed7aa", "#9a3412"
    else:  # DINE-IN or anything else
        icon, bg, border, text = "🍽️", "#f0fdf4", "#bbf7d0", "#166534"

    return f"""
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:{bg};border:1px solid {border};border-radius:8px;
                   padding:10px 18px;">
          <span style="font-size:14px;font-weight:700;color:{text};
                       letter-spacing:0.5px;">
            {icon} &nbsp;{label}
          </span>
        </td>
      </tr>
    </table>"""


def _order_summary_row(label: str, value: str, bold: bool = False) -> str:
    weight = "700" if bold else "400"
    return f"""
      <tr>
        <td style="padding:10px 16px;font-size:14px;color:#78716c;
                   border-bottom:1px solid #fef3c7;">{label}</td>
        <td style="padding:10px 16px;font-size:14px;color:#1c1917;
                   font-weight:{weight};text-align:right;
                   border-bottom:1px solid #fef3c7;">{value}</td>
      </tr>"""


def _order_table(*rows: str) -> str:
    return f"""
    <table cellpadding="0" cellspacing="0" width="100%"
           style="border:1px solid #fde68a;border-radius:10px;
                  overflow:hidden;margin:0 0 24px;">
      {''.join(rows)}
    </table>"""


def _info_badge(html: str) -> str:
    return f"""
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;">
      <tr>
        <td style="background:#fef3c7;border-left:4px solid #f59e0b;
                   border-radius:0 6px 6px 0;padding:12px 16px;">
          <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
            {html}
          </p>
        </td>
      </tr>
    </table>"""


# ── Tasks ─────────────────────────────────────────────────────────────────────

@shared_task
def send_order_received_email(order_id, user_email, user_name, order_type, total):
    subject = f'Order Received – #{order_id}'

    plain = f"""Hi {user_name},

We have received your order #{order_id}!

Order Type : {order_type.upper()}
Total      : €{total}

We are preparing your order now.
Estimated time: 45–60 minutes.

Thank you for ordering from Ravintola Amazona!
— Ravintola Amazona"""

    body_html = f"""
    {_greeting(user_name)}
    {_body_text(f"Your order <strong>#{order_id}</strong> has been received and we're already getting it ready for you. 🎉")}

    {_order_type_badge(order_type)}

    {_order_table(
        _order_summary_row("Order ID", f"#{order_id}"),
        _order_summary_row("Order Type", order_type.capitalize()),
        _order_summary_row("Total", f"€{total}", bold=True),
    )}

    {_info_badge("⏱️ <strong>Estimated time: 45–60 minutes.</strong><br/>We'll have it ready as soon as possible.")}

    {_divider()}
    {_body_text("Thank you for choosing Ravintola Amazona. We hope you enjoy your meal!")}
    {_signature()}
    """

    html = _wrap_email(body_html)
    msg = EmailMultiAlternatives(subject, plain, settings.DEFAULT_FROM_EMAIL, [user_email])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


@shared_task
def send_restaurant_notification_email(order_id, order_details):
    subject = f'🍽️ NEW ORDER – #{order_id}'

    plain = f"""NEW ORDER RECEIVED
==================
{order_details}
==================

Please prepare this order as soon as possible.
— Ravintola Amazona System"""

    body_html = f"""
    <!-- Alert banner -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="background:#f59e0b;border-radius:8px;padding:16px 20px;text-align:center;">
          <p style="margin:0;font-size:18px;font-weight:800;color:#ffffff;
                    letter-spacing:0.3px;">
            🍽️ &nbsp;New Order Received — #{order_id}
          </p>
        </td>
      </tr>
    </table>

    {_body_text("A new order has just come in. Please prepare it as soon as possible.")}

    <!-- Order details block -->
    <table cellpadding="0" cellspacing="0" width="100%"
           style="border:1px solid #fde68a;border-radius:10px;
                  overflow:hidden;margin:0 0 24px;">
      <tr>
        <td style="background:#fef3c7;padding:10px 16px;border-bottom:1px solid #fde68a;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1.5px;
                    text-transform:uppercase;color:#92400e;">
            Order Details
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;background:#ffffff;">
          <pre style="margin:0;font-size:13px;color:#1c1917;line-height:1.7;
                      font-family:'Courier New',monospace;white-space:pre-wrap;
                      word-break:break-word;">{order_details}</pre>
        </td>
      </tr>
    </table>

    {_info_badge("⚡ <strong>Action required:</strong> Please acknowledge and begin preparation immediately.")}
    {_signature()}
    """

    html = _wrap_email(body_html)
    msg = EmailMultiAlternatives(subject, plain, settings.DEFAULT_FROM_EMAIL, [settings.RESTAURANT_EMAIL])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)