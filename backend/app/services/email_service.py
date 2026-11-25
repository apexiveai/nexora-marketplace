
import smtplib

from email.message import EmailMessage

from app.core.config import settings


def send_verification_email(
    recipient: str,
    verification_url: str,
) -> None:
    if not all([
        settings.SMTP_HOST,
        settings.SMTP_USERNAME,
        settings.SMTP_PASSWORD,
        settings.SMTP_FROM_EMAIL,
    ]):
        raise RuntimeError(
            "SMTP configuration is incomplete."
        )

    message = EmailMessage()

    message["Subject"] = "Verify your NEXORA Seller Account"
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = recipient

    message.set_content(
        f"""
Welcome to NEXORA Marketplace!

Please verify your seller account using the link below:

{verification_url}

This link expires in 24 hours.

If you did not create this account, you can ignore this email.
"""
    )

    message.add_alternative(
        f"""
        <html>
          <body>
            <h2>Welcome to NEXORA Marketplace</h2>
            <p>Please verify your seller account.</p>
            <p>
              <a href="{verification_url}">
                Verify Email Address
              </a>
            </p>
            <p>This link expires in 24 hours.</p>
          </body>
        </html>
        """,
        subtype="html",
    )

    with smtplib.SMTP(
        settings.SMTP_HOST,
        settings.SMTP_PORT,
        timeout=15,
    ) as server:
        server.starttls()
        server.login(
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
        )
        server.send_message(message)
