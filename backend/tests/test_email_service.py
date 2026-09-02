import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import generate_secure_token, hash_token
from app.models.email_verification import EmailVerificationToken
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.services.auth_service import AuthService
from app.services.email_service import (
    BaseEmailProvider,
    EmailService,
    GmailSMTPProvider,
    ResendProvider,
)


# ---------------------------------------------------------
# 1. Provider Selection Tests
# ---------------------------------------------------------

def test_provider_selection_gmail():
    """Test get_provider returns GmailSMTPProvider for 'gmail'."""
    provider = EmailService.get_provider("gmail")
    assert isinstance(provider, GmailSMTPProvider)
    assert isinstance(provider, BaseEmailProvider)


def test_provider_selection_resend():
    """Test get_provider returns ResendProvider for 'resend'."""
    provider = EmailService.get_provider("resend")
    assert isinstance(provider, ResendProvider)
    assert isinstance(provider, BaseEmailProvider)


def test_provider_selection_invalid():
    """Test get_provider raises ValueError for unknown provider."""
    with pytest.raises(ValueError, match="Unsupported email provider: unknown"):
        EmailService.get_provider("unknown")


def test_provider_selection_from_settings():
    """Test get_provider reads provider from settings when not passed."""
    with patch.object(settings, "EMAIL_PROVIDER", "resend"):
        provider = EmailService.get_provider()
        assert isinstance(provider, ResendProvider)

    with patch.object(settings, "EMAIL_PROVIDER", "gmail"):
        provider = EmailService.get_provider()
        assert isinstance(provider, GmailSMTPProvider)


# ---------------------------------------------------------
# 2. Gmail SMTP Mocked Sending Tests
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_gmail_smtp_mocked_sending():
    """Test GmailSMTPProvider connects with TLS and sends email."""
    with patch.object(settings, "GMAIL_SMTP_HOST", "smtp.gmail.com"), \
         patch.object(settings, "GMAIL_SMTP_PORT", 587), \
         patch.object(settings, "GMAIL_SMTP_USERNAME", "testuser@gmail.com"), \
         patch.object(settings, "GMAIL_SMTP_PASSWORD", "mockapppassword16"), \
         patch.object(settings, "GMAIL_FROM_EMAIL", "testuser@gmail.com"), \
         patch.object(settings, "GMAIL_FROM_NAME", "KharchaPani"):

        mock_server = MagicMock()
        with patch("smtplib.SMTP", return_value=mock_server) as mock_smtp:
            mock_server.__enter__.return_value = mock_server

            provider = GmailSMTPProvider()
            result = await provider.send(
                to_email="recipient@example.com",
                subject="Test Gmail",
                html_content="<p>Test Body</p>",
                text_content="Test Body",
            )

            assert result is True
            mock_smtp.assert_called_once_with("smtp.gmail.com", 587)
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once_with("testuser@gmail.com", "mockapppassword16")
            mock_server.sendmail.assert_called_once()


# ---------------------------------------------------------
# 3. Resend Mocked Sending Tests
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_resend_mocked_sending():
    """Test ResendProvider sends email via async HTTP API."""
    mock_resp = httpx.Response(
        status_code=200,
        json={"id": "resend_msg_12345"},
        request=MagicMock(),
    )

    with patch.object(settings, "RESEND_API_KEY", "re_mock_key_999"), \
         patch.object(settings, "RESEND_FROM_EMAIL", "onboarding@resend.dev"), \
         patch.object(settings, "RESEND_FROM_NAME", "KharchaPani"):

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_resp

            provider = ResendProvider()
            result = await provider.send(
                to_email="target@example.com",
                subject="Test Resend",
                html_content="<p>Resend HTML</p>",
                text_content="Resend Text",
            )

            assert result is True
            mock_post.assert_called_once()
            call_kwargs = mock_post.call_args.kwargs
            assert "https://api.resend.com/emails" in mock_post.call_args.args[0]
            assert call_kwargs["json"]["to"] == ["target@example.com"]
            assert call_kwargs["headers"]["Authorization"] == "Bearer re_mock_key_999"


# ---------------------------------------------------------
# 4. Token Expiry & Single-Use Tests
# ---------------------------------------------------------

@pytest.mark.asyncio
async def test_verification_token_expiry(db_session: AsyncSession, test_user: User):
    """Test that an expired email verification token is rejected."""
    raw_token = generate_secure_token()
    token_hash = hash_token(raw_token)
    expired_time = datetime.now(timezone.utc) - timedelta(minutes=10)

    record = EmailVerificationToken(
        user_id=test_user.id,
        token_hash=token_hash,
        expires_at=expired_time,
        is_used=False,
    )
    db_session.add(record)
    await db_session.commit()

    with pytest.raises(Exception) as exc_info:
        await AuthService.verify_email(db_session, raw_token)
    assert "expired" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_verification_token_single_use(db_session: AsyncSession, test_user: User):
    """Test that a verification token can only be used once."""
    raw_token = await AuthService.create_email_verification_token(db_session, test_user.id)

    # First verification must succeed
    verified_user = await AuthService.verify_email(db_session, raw_token)
    assert verified_user.is_verified is True

    # Second verification with same token must fail
    with pytest.raises(Exception) as exc_info:
        await AuthService.verify_email(db_session, raw_token)
    assert "already used" in str(exc_info.value.detail).lower() or "invalid" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_password_reset_token_expiry(db_session: AsyncSession, test_user: User):
    """Test that an expired password reset token is rejected."""
    raw_token = generate_secure_token()
    token_hash = hash_token(raw_token)
    expired_time = datetime.now(timezone.utc) - timedelta(minutes=5)

    record = PasswordResetToken(
        user_id=test_user.id,
        token_hash=token_hash,
        expires_at=expired_time,
        is_used=False,
    )
    db_session.add(record)
    await db_session.commit()

    with pytest.raises(Exception) as exc_info:
        await AuthService.reset_password(db_session, raw_token, "NewPassword123!")
    assert "expired" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_password_reset_token_single_use(db_session: AsyncSession, test_user: User):
    """Test that a password reset token can only be used once."""
    raw_token = await AuthService.create_password_reset_token(db_session, test_user.email)
    assert raw_token is not None

    # First reset must succeed
    await AuthService.reset_password(db_session, raw_token, "NewPassword123!")

    # Second reset with same token must fail
    with pytest.raises(Exception) as exc_info:
        await AuthService.reset_password(db_session, raw_token, "AnotherPassword123!")
    assert "already used" in str(exc_info.value.detail).lower() or "invalid" in str(exc_info.value.detail).lower()
