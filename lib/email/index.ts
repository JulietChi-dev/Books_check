/**
 * Transactional Email Module (Nodemailer SMTP & Resend support)
 *
 * Dispatches transactional emails via:
 * 1. Nodemailer SMTP (when SMTP_HOST is configured)
 * 2. Resend API (when RESEND_API_KEY is configured)
 * 3. Terminal console logging (in development/testing when no credentials are provided)
 */

import nodemailer, { type Transporter } from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let smtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  if (!smtpTransporter) {
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return smtpTransporter;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  const fromEmail = process.env.FROM_EMAIL || "BooksCheck <no-reply@bookscheck.com>";

  // 1. Check for Nodemailer SMTP configuration
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text,
        html,
      });
      return true;
    } catch (err) {
      console.error("Nodemailer SMTP error:", err);
      return false;
    }
  }

  // 2. Check for Resend API Key fallback
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
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

  // 3. Development / Test fallback (logs to console when no email provider is configured)
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH - DEV/TEST (No SMTP configured)]`);
  console.log(`To: ${to}`);
  console.log(`From: ${fromEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`------------------------------------------------------`);
  console.log(`${text || html}`);
  console.log(`======================================================\n`);
  return true;
}

export async function sendVerificationEmail(email: string, rawToken: string): Promise<boolean> {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email/${rawToken}`;

  return sendEmail({
    to: email,
    subject: "Verify your BooksCheck email address",
    text: `Welcome to BooksCheck! Please verify your email address by visiting this link: ${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #182230; padding: 18px 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #34d399; letter-spacing: -0.02em;">BooksCheck</h1>
        </div>
        <h2 style="font-size: 18px; font-weight: 700; color: #182230; margin-top: 0;">Verify your email address</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
        <div style="margin: 32px 0;">
          <a href="${verifyUrl}" style="background-color: #0F766E; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">Or copy and paste this link in your browser:<br/><a href="${verifyUrl}" style="color: #0F766E; word-break: break-all;">${verifyUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #182230; padding: 18px 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #34d399; letter-spacing: -0.02em;">BooksCheck</h1>
        </div>
        <h2 style="font-size: 18px; font-weight: 700; color: #182230; margin-top: 0;">Reset your password</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">We received a request to reset your BooksCheck account password. Click the button below to choose a new password:</p>
        <div style="margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #0F766E; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">Or copy and paste this link in your browser:<br/><a href="${resetUrl}" style="color: #0F766E; word-break: break-all;">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">This link expires in 60 minutes and works once. If you did not request a password reset, no action is needed.</p>
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
  const verifyUrl = `${appUrl}/verify-email/${rawToken}`;

  return sendEmail({
    to: newEmail,
    subject: "Verify your new BooksCheck email address",
    text: `You requested to change your BooksCheck login email. Click the link below to confirm: ${verifyUrl}\n\nThis link expires in 24 hours. Your old email stays active until you verify the new one.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #182230; padding: 18px 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #34d399; letter-spacing: -0.02em;">BooksCheck</h1>
        </div>
        <h2 style="font-size: 18px; font-weight: 700; color: #182230; margin-top: 0;">Confirm your new email address</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">You requested to change your BooksCheck login email to <strong>${newEmail}</strong>. Click the link below to confirm:</p>
        <div style="margin: 32px 0;">
          <a href="${verifyUrl}" style="background-color: #0F766E; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
            Confirm New Email
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">Or copy and paste this link in your browser:<br/><a href="${verifyUrl}" style="color: #0F766E; word-break: break-all;">${verifyUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">This link expires in 24 hours. Your old email stays active until you verify the new one. If you did not make this request, ignore this email.</p>
      </div>
    `,
  });
}
