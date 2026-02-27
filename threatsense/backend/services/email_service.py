import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from core.config import settings
import uuid

class EmailService:
    def __init__(self):
        # SMTP Configuration from settings
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        
        # The base URL for email verification links (from config.py)
        self.base_url = settings.BASE_URL

    def send_verification_email(self, to_email: str, user_id: str):
        """Generates UUID tokens and sends verification email via SMTP"""
        
        # 1. Generate unique security tokens for both buttons
        verify_token = str(uuid.uuid4())
        kill_token = str(uuid.uuid4())
        
        # 2. These links will hit our FastAPI endpoints
        yes_link = f"{self.base_url}/api/auth/verify/{verify_token}?email={to_email}"
        no_link = f"{self.base_url}/api/auth/report_compromise/{kill_token}?email={to_email}"

        print("\n" + "="*50)
        print(f"EMAIL GENERATED FOR: {to_email}")
        print("Subject: ThreatSense Login Attempt Detected")
        print(f"CONFIRM: 'Yes, I'm In' Link: {yes_link}")
        print(f"REPORT: 'This is not me' Link: {no_link}")
        print("="*50 + "\n")

        # 3. Prepare Email Content
        subject = f'[SECURITY] ThreatSense Verification - {user_id}'
        body_text = f'Verify your login for {user_id}: {yes_link} or report: {no_link}'
        body_html = f'''
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #d32f2f;">Critical: Identity Verification Needed</h2>
                <p>A login was attempted for <b>{user_id}</b>.</p>
                <p>If this was you, please click below to confirm:</p>
                <a href="{yes_link}" style="display: inline-block; padding: 10px 20px; background: #2e7d32; color: #fff; text-decoration: none; border-radius: 4px;">✔ Yes, I'm In</a>
                <p>If this was <b>NOT</b> you, click here immediately:</p>
                <a href="{no_link}" style="display: inline-block; padding: 10px 20px; background: #c62828; color: #fff; text-decoration: none; border-radius: 4px;">✖ Not Me - Terminate Session</a>
            </div>
        '''

        # 4. Attempt to send actual email if credentials are not placeholders
        if "your-email" not in self.smtp_username:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = self.from_email
                msg["To"] = to_email

                part1 = MIMEText(body_text, "plain")
                part2 = MIMEText(body_html, "html")
                msg.attach(part1)
                msg.attach(part2)

                # Connect and send
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()  # Secure the connection
                    server.login(self.smtp_username, self.smtp_password)
                    server.sendmail(self.from_email, to_email, msg.as_string())
                
                print(f"SUCCESS: Email sent to {to_email} via SMTP ({self.smtp_server})")
            except Exception as e:
                print(f"FATAL ERROR: SMTP failed for {to_email}. Error type: {type(e).__name__}")
                print(f"Details: {e}")
                print("HINT: If using Gmail, make sure you use an 'App Password' and that Less Secure Apps are handled correctly.")
        else:
            print(f"INFO: Email simulation mode active. Connect your SMTP credentials in config.py for real emails.")
        
        return {
            "verify_token": verify_token,
            "kill_token": kill_token
        }

# Create a singleton instance
email_service = EmailService()
