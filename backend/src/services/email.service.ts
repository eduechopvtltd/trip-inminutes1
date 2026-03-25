// src/services/email.service.ts

interface EmailService {
  sendVerificationEmail(to: string, name: string, otp: string): Promise<void>;
  sendPasswordResetEmail(to: string, name: string, otp: string): Promise<void>;
  sendBookingConfirmation(to: string, name: string, ref: string, pkg: string, amount: number): Promise<void>;
  sendWelcomeEmail(to: string, name: string): Promise<void>;
}

// HTML template helper
function emailWrapper(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  body { margin:0; padding:0; background:#f4f2ee; font-family:'DM Sans',Arial,sans-serif; }
  .wrap { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 32px rgba(10,22,40,.1); }
  .header { background:linear-gradient(135deg,#0A1628,#162040); padding:32px 40px; }
  .logo { font-size:22px; font-weight:800; color:#C9A84C; letter-spacing:.5px; }
  .logo span { color:#fff; }
  .body { padding:40px; }
  h1 { color:#0A1628; font-size:24px; margin:0 0 16px; }
  p { color:#555; line-height:1.7; margin:0 0 16px; font-size:15px; }
  .otp { font-size:36px; font-weight:800; color:#0A1628; letter-spacing:8px; text-align:center; background:#f9f7f2; border:2px dashed #C9A84C; border-radius:12px; padding:20px; margin:24px 0; }
  .btn { display:block; width:fit-content; background:#C9A84C; color:#0A1628; padding:14px 32px; border-radius:100px; font-weight:700; font-size:15px; text-decoration:none; margin:24px 0; }
  .booking-box { background:#f9f7f2; border-radius:12px; padding:20px 24px; margin:20px 0; }
  .booking-box p { margin:4px 0; font-size:14px; }
  .booking-box strong { color:#0A1628; }
  .footer { background:#f4f2ee; padding:20px 40px; text-align:center; font-size:12px; color:#999; }
  .footer a { color:#C9A84C; text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">Trip<span>InMinutes</span></div>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    © 2026 TripInMinutes Pvt. Ltd. · <a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a><br>
    101 Travel Tower, Andheri West, Mumbai 400053
  </div>
</div>
</body>
</html>`;
}

// Concrete implementation (console-log fallback when no API key configured)
class EmailServiceImpl implements EmailService {
  private async send(to: string, subject: string, html: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey && apiKey !== 're_your_resend_api_key') {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: process.env.FROM_EMAIL ?? 'noreply@tripinminutes.com',
          to,
          subject,
          html,
        });
        return;
      } catch (err) {
        console.error('Email send failed via Resend:', err);
      }
    }

    // Dev fallback — log to console
    console.log(`\n📧 [EMAIL] To: ${to} | Subject: ${subject}\n`);
  }

  async sendVerificationEmail(to: string, name: string, otp: string): Promise<void> {
    const html = emailWrapper('Verify Your Email', `
      <h1>Hi ${name}, welcome! 🎉</h1>
      <p>You're one step away from accessing amazing travel deals. Please verify your email with the OTP below:</p>
      <div class="otp">${otp}</div>
      <p style="text-align:center;font-size:13px;color:#999;">This OTP expires in 15 minutes.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `);
    await this.send(to, 'Verify your TripInMinutes account', html);
  }

  async sendPasswordResetEmail(to: string, name: string, otp: string): Promise<void> {
    const html = emailWrapper('Reset Your Password', `
      <h1>Password Reset Request</h1>
      <p>Hi ${name}, we received a request to reset your password. Use the OTP below:</p>
      <div class="otp">${otp}</div>
      <p style="text-align:center;font-size:13px;color:#999;">This OTP expires in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
    `);
    await this.send(to, 'Reset your TripInMinutes password', html);
  }

  async sendBookingConfirmation(to: string, name: string, ref: string, pkg: string, amount: number): Promise<void> {
    const html = emailWrapper('Booking Confirmed!', `
      <h1>Your booking is confirmed! ✈️</h1>
      <p>Hi ${name}, great news! We've received your booking and our team is reviewing it.</p>
      <div class="booking-box">
        <p><strong>Booking Reference:</strong> #${ref}</p>
        <p><strong>Package:</strong> ${pkg}</p>
        <p><strong>Total Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
        <p><strong>Status:</strong> Under Review</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard/bookings" class="btn">View Booking →</a>
      <p>Our travel expert will contact you within 24 hours to confirm all details. For urgent queries, call us at <strong>+91 88000 01234</strong>.</p>
    `);
    await this.send(to, `Booking Confirmed — #${ref}`, html);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = emailWrapper('Welcome to TripInMinutes!', `
      <h1>Welcome aboard, ${name}! 🌍</h1>
      <p>Your account is all set. Explore thousands of curated travel packages, book flights, hotels, and more — all in one place.</p>
      <a href="${process.env.FRONTEND_URL}/packages" class="btn">Explore Packages →</a>
      <p>Need help planning your first trip? Our travel experts are available Mon–Sat, 9 AM – 8 PM.</p>
    `);
    await this.send(to, 'Welcome to TripInMinutes — Your journey starts here!', html);
  }
}

export const emailService = new EmailServiceImpl();
