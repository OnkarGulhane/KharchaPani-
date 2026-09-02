import asyncio
import logging
import smtplib
import ssl
from abc import ABC, abstractmethod
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class BaseEmailProvider(ABC):
    """Abstract Base Class for email providers."""

    @abstractmethod
    async def send(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send an email asynchronously."""
        pass


class GmailSMTPProvider(BaseEmailProvider):
    """Gmail / Standard SMTP provider using Python smtplib with TLS."""

    async def send(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        host = settings.GMAIL_SMTP_HOST or "smtp.gmail.com"
        port = settings.GMAIL_SMTP_PORT or 587
        username = settings.GMAIL_SMTP_USERNAME
        password = settings.GMAIL_SMTP_PASSWORD
        from_email = settings.GMAIL_FROM_EMAIL or username or "noreply@kharchapani.local"
        from_name = settings.GMAIL_FROM_NAME or "KharchaPani"

        if not username or not password:
            logger.info(
                f"[GmailSMTPProvider] Credentials not configured. Simulating email dispatch to {to_email} (Subject: {subject})."
            )
            return True

        def _sync_smtp_send() -> bool:
            from_addr = f"{from_name} <{from_email}>"
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = from_addr
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain", "utf-8"))
            if html_content:
                msg.attach(MIMEText(html_content, "html", "utf-8"))

            with smtplib.SMTP(host, port) as server:
                context = ssl.create_default_context()
                server.starttls(context=context)
                server.login(username, password)
                server.sendmail(from_email, [to_email], msg.as_string())

            logger.info(f"[GmailSMTPProvider] Email successfully sent to {to_email}")
            return True

        try:
            return await asyncio.to_thread(_sync_smtp_send)
        except Exception as exc:
            logger.error(f"[GmailSMTPProvider] Failed sending email: {exc}")
            return False


class ResendProvider(BaseEmailProvider):
    """Resend API provider using async HTTP client."""

    async def send(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        api_key = settings.RESEND_API_KEY
        from_email = settings.RESEND_FROM_EMAIL or "onboarding@resend.dev"
        from_name = settings.RESEND_FROM_NAME or "KharchaPani"

        if not api_key:
            logger.info(
                f"[ResendProvider] RESEND_API_KEY not configured. Simulating email dispatch to {to_email} (Subject: {subject})."
            )
            return True

        from_address = f"{from_name} <{from_email}>"
        payload = {
            "from": from_address,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        if text_content:
            payload["text"] = text_content

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post("https://api.resend.com/emails", json=payload, headers=headers)
                if resp.status_code in (200, 201, 202):
                    logger.info(f"[ResendProvider] Email sent to {to_email}")
                    return True
                else:
                    logger.error(f"[ResendProvider] API returned status {resp.status_code}")
                    return False
        except Exception as exc:
            logger.error(f"[ResendProvider] Failed sending email: {exc}")
            return False


class EmailService:
    """Provider-independent Email Service managing business templates and provider dispatch."""

    @staticmethod
    def get_provider(provider_name: Optional[str] = None) -> BaseEmailProvider:
        """Instantiate email provider based on configuration or override."""
        name = (provider_name or settings.EMAIL_PROVIDER or "gmail").strip().lower()
        if name in ("gmail", "smtp"):
            return GmailSMTPProvider()
        elif name == "resend":
            return ResendProvider()
        else:
            raise ValueError(f"Unsupported email provider: {name}")

    @classmethod
    async def send_email(
        cls,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        provider_name: Optional[str] = None,
    ) -> bool:
        """Route email to the selected independent provider."""
        try:
            provider = cls.get_provider(provider_name)
            return await provider.send(
                to_email=to_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )
        except Exception as exc:
            logger.error(f"[EmailService] Email dispatch failed: {exc}")
            return False

    @classmethod
    async def send_verification_email(
        cls,
        to_email: str,
        verification_token: str,
        user_name: Optional[str] = None,
    ) -> bool:
        """Send email verification link to user."""
        frontend_base = settings.FRONTEND_URL.rstrip("/")
        verify_link = f"{frontend_base}/verify-email?token={verification_token}"
        expire_minutes = settings.EMAIL_VERIFICATION_EXPIRE_MINUTES
        recipient_name = user_name or "KharchaPani User"

        subject = "Verify Your KharchaPani Account"

        text_content = (
            f"Hello {recipient_name},\n\n"
            f"Welcome to KharchaPani! Please verify your email address to activate your account.\n\n"
            f"Verification link:\n"
            f"{verify_link}\n\n"
            f"This link will expire in {expire_minutes} minutes.\n\n"
            f"If you did not create a KharchaPani account, please ignore this email.\n\n"
            f"Best regards,\n"
            f"The KharchaPani Team"
        )

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070b14; color: #f1f5f9; margin: 0; padding: 0; }}
    .container {{ max-width: 580px; margin: 30px auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #10b98133; }}
    .title {{ font-size: 22px; font-weight: 700; color: #ffffff; margin: 0; }}
    .body {{ padding: 32px 28px; line-height: 1.6; color: #cbd5e1; font-size: 15px; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #022c22 !important; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; margin: 24px 0; }}
    .note {{ background: #1e293b80; border-left: 3px solid #10b981; padding: 12px 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #94a3b8; }}
    .fallback {{ font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; }}
    .fallback a {{ color: #34d399; }}
    .footer {{ background: #090e1a; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 32px; margin-bottom: 8px;">💰</div>
      <h1 class="title">KharchaPani</h1>
    </div>
    <div class="body">
      <p>Hello <strong>{recipient_name}</strong>,</p>
      <p>Thank you for registering. Please click the button below to verify your email address:</p>
      <div style="text-align: center;">
        <a href="{verify_link}" class="btn" target="_blank">Verify Email Address</a>
      </div>
      <div class="note">
        ⏰ <strong>Note:</strong> This verification link expires in <strong>{expire_minutes} minutes</strong> and is valid for a single use.
      </div>
      <p style="font-size: 13px; color: #94a3b8;">
        If you did not register for KharchaPani, you can safely ignore this email.
      </p>
      <div class="fallback">
        Or copy and paste this link into your browser:<br>
        <a href="{verify_link}">{verify_link}</a>
      </div>
    </div>
    <div class="footer">&copy; 2026 KharchaPani. All rights reserved.</div>
  </div>
</body>
</html>"""

        return await cls.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )

    @classmethod
    async def send_password_reset_email(
        cls,
        to_email: str,
        reset_token: str,
        user_name: Optional[str] = None,
    ) -> bool:
        """Send password reset link to user."""
        frontend_base = settings.FRONTEND_URL.rstrip("/")
        reset_link = f"{frontend_base}/reset-password?token={reset_token}"
        expire_minutes = settings.PASSWORD_RESET_EXPIRE_MINUTES
        recipient_name = user_name or "KharchaPani User"

        subject = "Reset Your KharchaPani Password"

        text_content = (
            f"Hello {recipient_name},\n\n"
            f"We received a request to reset your KharchaPani password.\n\n"
            f"Reset password link:\n"
            f"{reset_link}\n\n"
            f"This link will expire in {expire_minutes} minutes.\n\n"
            f"If you did not request a password reset, you can safely ignore this email.\n\n"
            f"Best regards,\n"
            f"The KharchaPani Team"
        )

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070b14; color: #f1f5f9; margin: 0; padding: 0; }}
    .container {{ max-width: 580px; margin: 30px auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #10b98133; }}
    .title {{ font-size: 22px; font-weight: 700; color: #ffffff; margin: 0; }}
    .body {{ padding: 32px 28px; line-height: 1.6; color: #cbd5e1; font-size: 15px; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #022c22 !important; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none; margin: 24px 0; }}
    .note {{ background: #1e293b80; border-left: 3px solid #10b981; padding: 12px 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #94a3b8; }}
    .fallback {{ font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; }}
    .fallback a {{ color: #34d399; }}
    .footer {{ background: #090e1a; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 32px; margin-bottom: 8px;">💰</div>
      <h1 class="title">KharchaPani</h1>
    </div>
    <div class="body">
      <p>Hello <strong>{recipient_name}</strong>,</p>
      <p>We received a request to reset the password for your KharchaPani account. Click the button below to set a new password:</p>
      <div style="text-align: center;">
        <a href="{reset_link}" class="btn" target="_blank">Reset Password</a>
      </div>
      <div class="note">
        ⏰ <strong>Note:</strong> This link expires in <strong>{expire_minutes} minutes</strong> and is valid for a single use.
      </div>
      <p style="font-size: 13px; color: #94a3b8;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
      <div class="fallback">
        Or copy and paste this link into your browser:<br>
        <a href="{reset_link}">{reset_link}</a>
      </div>
    </div>
    <div class="footer">&copy; 2026 KharchaPani. All rights reserved.</div>
  </div>
</body>
</html>"""

        return await cls.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
        )
