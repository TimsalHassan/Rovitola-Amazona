from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

# ── Shared amber-500 HTML shell ───────────────────────────────────────────────

def _wrap_email(body_html: str) -> str:
    """Wrap body content in the Ravintola Amazona branded email shell."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ravintola Amazona</title>
</head>
<body style="margin:0;padding:0;background-color:#fafaf9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;background:#ffffff;
                      border-radius:12px;overflow:hidden;
                      box-shadow:0 2px 12px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background-color:#f59e0b;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:3px;
                        text-transform:uppercase;color:#7c2d12;opacity:0.75;">
                Ravintola
              </p>
              <h1 style="margin:4px 0 0;font-size:28px;font-weight:800;
                         color:#ffffff;letter-spacing:-0.5px;">
                Amazona
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              {body_html}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fef3c7;padding:20px 40px;text-align:center;
                       border-top:1px solid #fde68a;">
              <p style="margin:0;font-size:12px;color:#92400e;line-height:1.6;">
                © Ravintola Amazona &nbsp;·&nbsp; This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _amber_button(label: str, href: str) -> str:
    return f"""
    <table cellpadding="0" cellspacing="0" style="margin:28px auto;">
      <tr>
        <td style="background-color:#f59e0b;border-radius:8px;">
          <a href="{href}"
             style="display:inline-block;padding:14px 32px;font-size:15px;
                    font-weight:700;color:#ffffff;text-decoration:none;
                    letter-spacing:0.2px;">
            {label}
          </a>
        </td>
      </tr>
    </table>"""


def _greeting(name: str) -> str:
    return f'<p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#1c1917;">Hi {name} 👋</p>'


def _body_text(text: str) -> str:
    return f'<p style="margin:0 0 16px;font-size:15px;color:#44403c;line-height:1.7;">{text}</p>'


def _divider() -> str:
    return '<hr style="border:none;border-top:1px solid #fde68a;margin:24px 0;" />'


def _fallback_link(href: str) -> str:
    return f"""
    <p style="margin:16px 0 0;font-size:12px;color:#a8a29e;word-break:break-all;">
      If the button doesn't work, copy this link:<br/>
      <a href="{href}" style="color:#d97706;">{href}</a>
    </p>"""


def _signature() -> str:
    return """
    <p style="margin:24px 0 0;font-size:14px;color:#78716c;">
      Warm regards,<br/>
      <strong style="color:#d97706;">The Ravintola Amazona Team</strong>
    </p>"""


# ── Tasks ─────────────────────────────────────────────────────────────────────

@shared_task
def send_verification_email(user_email, user_name, verification_link):
    subject = 'Verify your email – Ravintola Amazona'

    plain = f"""Hi {user_name},

Thank you for registering! Please verify your email address:
{verification_link}

This link will expire in 24 hours.
If you did not create an account, you can ignore this email.

— Ravintola Amazona"""

    body_html = f"""
    {_greeting(user_name)}
    {_body_text("Thank you for registering with us! To complete your sign-up, please verify your email address.")}
    {_amber_button("Verify Email Address", verification_link)}
    {_fallback_link(verification_link)}
    {_divider()}
    {_body_text('<strong>This link expires in 24 hours.</strong> If you didn\'t create an account, you can safely ignore this email.')}
    {_signature()}
    """

    html = _wrap_email(body_html)
    msg = EmailMultiAlternatives(subject, plain, settings.DEFAULT_FROM_EMAIL, [user_email])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


@shared_task
def send_registration_email(user_email, user_name):
    subject = 'Welcome to Ravintola Amazona!'

    plain = f"""Hi {user_name},

Welcome! Your account has been created successfully.
You can now order your favourite food online.

Enjoy your meal!
— Ravintola Amazona"""

    body_html = f"""
    {_greeting(user_name)}
    {_body_text("Your account has been created successfully — welcome to the family! 🎉")}
    {_body_text("You can now browse our menu and order your favourite dishes online. We can't wait to serve you.")}
    <table cellpadding="0" cellspacing="0" style="margin:28px auto;">
      <tr>
        <td style="background-color:#f59e0b;border-radius:8px;">
          <a href="{settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else '#'}"
             style="display:inline-block;padding:14px 32px;font-size:15px;
                    font-weight:700;color:#ffffff;text-decoration:none;">
            Start Ordering
          </a>
        </td>
      </tr>
    </table>
    {_divider()}
    {_body_text("Enjoy your meal! 🍽️")}
    {_signature()}
    """

    html = _wrap_email(body_html)
    msg = EmailMultiAlternatives(subject, plain, settings.DEFAULT_FROM_EMAIL, [user_email])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


@shared_task
def send_forgot_password_email(user_email, user_name, reset_link):
    subject = 'Password Reset Request – Ravintola Amazona'

    plain = f"""Hi {user_name},

We received a request to reset your password.
Click the link below to reset it:
{reset_link}

This link will expire in 1 hour.
If you did not request this, ignore this email.

— Ravintola Amazona"""

    body_html = f"""
    {_greeting(user_name)}
    {_body_text("We received a request to reset the password for your account. Click the button below to choose a new password.")}
    {_amber_button("Reset My Password", reset_link)}
    {_fallback_link(reset_link)}
    {_divider()}
    {_body_text('<strong>This link expires in 1 hour.</strong> If you didn\'t request a password reset, no action is needed — your account is safe.')}
    {_signature()}
    """

    html = _wrap_email(body_html)
    msg = EmailMultiAlternatives(subject, plain, settings.DEFAULT_FROM_EMAIL, [user_email])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


@shared_task
def send_password_changed_email(user_email, user_name):
    subject = 'Password Changed Successfully – Ravintola Amazona'

    plain = f"""Hi {user_name},

Your password has been changed successfully.
If you did not make this change, contact us immediately.

— Ravintola Amazona"""

    body_html = f"""
    {_greeting(user_name)}

    <!-- Success badge -->
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="background-color:#fef3c7;border-left:4px solid #f59e0b;
                   border-radius:0 6px 6px 0;padding:12px 16px;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#92400e;">
            ✅ &nbsp;Your password was updated successfully.
          </p>
        </td>
      </tr>
    </table>

    {_body_text("If you made this change, no further action is needed.")}
    {_divider()}
    {_body_text('⚠️ <strong>Didn\'t change your password?</strong> Your account may be at risk. Please <a href="mailto:support@amazona.fi" style="color:#d97706;">contact us immediately</a> or reset your password right away.')}
    {_signature()}
    """

    html = _wrap_email(body_html)
    msg = EmailMultiAlternatives(subject, plain, settings.DEFAULT_FROM_EMAIL, [user_email])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)