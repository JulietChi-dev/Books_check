/**
 * Transactional Email Module (PRD 8.1, Resend Integration)
 *
 * All transactional emails are dispatched through this module.
 * Uses native fetch to https://api.resend.com/emails with RESEND_API_KEY.
 * Falls back to console logging in development/test when key is absent.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "BooksCheck <onboarding@resend.dev>";

  if (!apiKey) {
    // Development / Test fallback
    console.log(`\n[EMAIL DISPATCH - DEV/TEST]`);
    console.log(`To: ${to}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text || html}\n`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Resend API error (${res.status}):`, errBody);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
    return false;
  }
}

export async function sendVerificationEmail(email: string, rawToken: string): Promise<boolean> {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email/${rawToken}`;

  return sendEmail({
    to: email,
    subject: "Verify your BooksCheck email address",
    text: `Welcome to BooksCheck! Please verify your email address by visiting this link: ${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Verify your email address</h2>
        <p>Thank you for signing up for BooksCheck. Click the link below to verify your email address:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, rawToken: string): Promise<boolean> {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password/${rawToken}`;

  return sendEmail({
    to: email,
    subject: "Reset your BooksCheck password",
    text: `We received a request to reset your password. Use the following link to choose a new password: ${resetUrl}\n\nThis link expires in 60 minutes and can only be used once.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Reset your BooksCheck password</h2>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">This link expires in 60 minutes and works once. If you did not request a password reset, no action is needed.</p>
      </div>
    `,
  });
}

/**
 * Sends a verification link to the NEW email address when the manager requests
 * a login email change (PRD FR-85). The old address stays active until the
 * new one is verified.
 */
export async function sendChangeEmailVerification(
  newEmail: string,
  rawToken: string
): Promise<boolean> {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  // Reuse the verify-email route — it checks token kind and updates the email
  const verifyUrl = `${appUrl}/verify-email/${rawToken}`;

  return sendEmail({
    to: newEmail,
    subject: "Verify your new BooksCheck email address",
    text: `You requested to change your BooksCheck login email. Click the link below to confirm: ${verifyUrl}\n\nThis link expires in 24 hours. Your old email stays active until you verify the new one.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Confirm your new email address</h2>
        <p>You requested to change your BooksCheck login email to <strong>${newEmail}</strong>. Click the link below to confirm:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Confirm new email
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">This link expires in 24 hours. Your old email stays active until you verify the new one. If you did not make this request, ignore this email.</p>
      </div>
    `,
  });
}
