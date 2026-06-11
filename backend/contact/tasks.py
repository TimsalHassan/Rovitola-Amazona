from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

from .tasks import _wrap_email, _greeting, _body_text, _divider, _signature
from orders.tasks import _info_badge


# ── Helpers ───────────────────────────────────────────────────────────────────

def _contact_detail_row(label: str, value: str) -> str:
    return f"""
      <tr>
        <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#92400e;
                   background:#fef9ee;border-bottom:1px solid #fef3c7;
                   white-space:nowrap;width:1%;">{label}</td>
        <td style="padding:10px 16px;font-size:14px;color:#1c1917;
                   border-bottom:1px solid #fef3c7;">{value}</td>
      </tr>"""


def _contact_table(*rows: str) -> str:
    return f"""
    <table cellpadding="0" cellspacing="0" width="100%"
           style="border:1px solid #fde68a;border-radius:10px;
                  overflow:hidden;margin:0 0 24px;">
      {''.join(rows)}
    </table>"""


def _message_block(message: str) -> str:
    return f"""
    <table cellpadding="0" cellspacing="0" width="100%"
           style="border:1px solid #fde68a;border-radius:10px;
                  overflow:hidden;margin:0 0 24px;">
      <tr>
        <td style="background:#fef3c7;padding:10px 16px;border-bottom:1px solid #fde68a;">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1.5px;
                    text-transform:uppercase;color:#92400e;">Message</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;background:#ffffff;">
          <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.8;
                    white-space:pre-wrap;">{message}</p>
        </td>
      </tr>
    </table>"""


# ── Tasks ─────────────────────────────────────────────────────────────────────

@shared_task
def send_contact_notification(name, email, phone, subject, message):
    """Restaurant owner ko notification bhejna"""
    email_subject = f"New Contact Form Message: {subject}"

    plain = f"""You have received a new message from the contact form.

Name: {name}
Email: {email}
Phone: {phone}
Subject: {subject}

Message:
{message}

---
Reply directly to: {email}"""

    body_html = f"""
    <!-- Alert banner -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="background:#f59e0b;border-radius:8px;padding:16px 20px;text-align:center;">
          <p style="margin:0;font-size:17px;font-weight:800;color:#ffffff;letter-spacing:0.3px;">
            📬 &nbsp;New Contact Form Message
          </p>
        </td>
      </tr>
    </table>

    {_body_text("Someone has submitted the contact form on your website. Here are the details:")}

    {_contact_table(
        _contact_detail_row("Name", name),
        _contact_detail_row("Email", f'<a href="mailto:{email}" style="color:#d97706;text-decoration:none;">{email}</a>'),
        _contact_detail_row("Phone", phone or "—"),
        _contact_detail_row("Subject", subject),
    )}

    {_message_block(message)}

    {_info_badge(f'💬 <strong>Reply directly to:</strong> <a href="mailto:{email}" style="color:#92400e;">{email}</a>')}
    {_signature()}
    """

    html = _wrap_email(body_html)
    msg = EmailMultiAlternatives(email_subject, plain, settings.DEFAULT_FROM_EMAIL, [settings.RESTAURANT_EMAIL])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


@shared_task
def send_contact_confirmation(name, email, phone, subject):
    """Customer ko confirmation bhejna"""
    email_subject = "We received your message — Ravintola Amazona"

    plain = f"""Hi {name},

Thank you for contacting us! We have received your message regarding "{subject}".

We will get back to you as soon as possible.

— Ravintola Amazona"""

    body_html = f"""
    {_greeting(name)}
    {_body_text("Thank you for reaching out! We've received your message and will get back to you as soon as possible.")}

    {_contact_table(
        _contact_detail_row("Subject", subject),
        _contact_detail_row("Your Email", email),
        _contact_detail_row("Your Phone", phone or "—"),
    )}

    {_info_badge("🕐 <strong>Typical response time: 1–2 business days.</strong><br/>We'll reply to the email address you provided.")}

    {_divider()}
    {_body_text("In the meantime, feel free to browse our menu or call us directly if your matter is urgent.")}
    {_signature()}
    """

    html = _wrap_email(body_html)
    msg = EmailMultiAlternatives(email_subject, plain, settings.DEFAULT_FROM_EMAIL, [email])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)