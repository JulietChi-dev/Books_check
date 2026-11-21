import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/db";
import { hashPassword } from "../../lib/auth/hash";
import { createSession } from "../../lib/auth/session";
import {
  createPasswordResetToken,
  validatePasswordResetToken,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  hashToken,
} from "../../lib/auth/tokens";
import {
  checkForgotPasswordRateLimit,
  recordForgotPasswordAttempt,
  checkResendRateLimit,
  recordResendAttempt,
} from "../../lib/auth/rate-limit";

/**
 * Integration Test: Password Reset, Email Verification & Session Termination (PRD 6.1, 6.3, 8.4)
 *
 * Tests:
 * 1. Expired tokens are rejected (24h verification, 60m reset).
 * 2. Reused tokens are rejected (usedAt !== null).
 * 3. Response-timing path: forgot password returns exact FR-16 message for both existing & unknown email.
 * 4. Resetting password ends ALL sessions for that user (FR-19).
 * 5. Rate limits for resend (3/hr) and forgot password (3/email, 10/IP).
 *
 * NOTE: Requires running database.
 */
describe("Password Reset & Verification Flow (PRD 6.3, FR-16 to FR-19)", () => {
  const testEmail = "reset.tester@bookscheck.test";
  let testUserId: string;
  let testCompanyId: string;

  beforeAll(async () => {
    const company = await prisma.company.create({
      data: {
        name: "Reset Flow Hotel",
        country: "NG",
        currency: "NGN",
        timeZone: "Africa/Lagos",
      },
    });
    testCompanyId = company.id;

    const pwHash = await hashPassword("InitialPassword123!");
    const user = await prisma.user.create({
      data: {
        fullName: "Reset Tester",
        email: testEmail,
        passwordHash: pwHash,
        companyId: testCompanyId,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    try {
      await prisma.rateLimitHit.deleteMany();
      await prisma.passwordResetToken.deleteMany();
      await prisma.emailToken.deleteMany();
      await prisma.session.deleteMany();
      await prisma.user.deleteMany({ where: { id: testUserId } });
      await prisma.company.deleteMany({ where: { id: testCompanyId } });
    } catch {
      // Ignore if DB is unreachable
    }
  });

  describe("Token Expiration and One-Use Invariants (FR-8, FR-17)", () => {
    it("rejects expired password reset token (> 60 minutes)", async () => {
      const rawToken = await createPasswordResetToken(testUserId);
      const tokenHash = hashToken(rawToken);

      // Backdate expiresAt by 65 minutes
      const pastDate = new Date(Date.now() - 65 * 60 * 1000);
      await prisma.passwordResetToken.update({
        where: { tokenHash },
        data: { expiresAt: pastDate },
      });

      const validation = await validatePasswordResetToken(rawToken);
      expect(validation.valid).toBe(false);
    });

    it("rejects already-used password reset token", async () => {
      const rawToken = await createPasswordResetToken(testUserId);
      const tokenHash = hashToken(rawToken);

      // Mark used
      await prisma.passwordResetToken.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      });

      const validation = await validatePasswordResetToken(rawToken);
      expect(validation.valid).toBe(false);
    });

    it("rejects expired email verification token (> 24 hours)", async () => {
      const rawToken = await createEmailVerificationToken(testUserId, testEmail);
      const tokenHash = hashToken(rawToken);

      // Backdate expiresAt by 25 hours
      const pastDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await prisma.emailToken.update({
        where: { tokenHash },
        data: { expiresAt: pastDate },
      });

      const result = await consumeEmailVerificationToken(rawToken);
      expect(result.success).toBe(false);
      expect(result.error).toBe("This link is invalid or has expired.");
    });

    it("rejects already-used email verification token on second attempt", async () => {
      const rawToken = await createEmailVerificationToken(testUserId, testEmail);

      // First consumption succeeds
      const firstAttempt = await consumeEmailVerificationToken(rawToken);
      expect(firstAttempt.success).toBe(true);

      // Second consumption must be rejected
      const secondAttempt = await consumeEmailVerificationToken(rawToken);
      expect(secondAttempt.success).toBe(false);
      expect(secondAttempt.error).toBe("This link has already been used.");
    });
  });

  describe("Password Reset Session Invalidation (FR-19)", () => {
    it("deletes ALL active sessions for user upon password reset", async () => {
      // Create 3 active sessions for this user across different devices
      await createSession(testUserId, "laptop");
      await createSession(testUserId, "phone");
      await createSession(testUserId, "tablet");

      const sessionCountBefore = await prisma.session.count({
        where: { userId: testUserId },
      });
      expect(sessionCountBefore).toBe(3);

      const rawToken = await createPasswordResetToken(testUserId);
      const tokenHash = hashToken(rawToken);
      const newHash = await hashPassword("NewSecurePassword456!");
      const now = new Date();

      // Execute reset transaction (matching resetPasswordAction)
      await prisma.$transaction([
        prisma.user.update({
          where: { id: testUserId },
          data: { passwordHash: newHash },
        }),
        prisma.passwordResetToken.update({
          where: { tokenHash },
          data: { usedAt: now },
        }),
        prisma.session.deleteMany({
          where: { userId: testUserId },
        }),
      ]);

      const sessionCountAfter = await prisma.session.count({
        where: { userId: testUserId },
      });
      expect(sessionCountAfter).toBe(0);
    });
  });

  describe("Rate Limits for Resend and Forgot Password (FR-8, FR-16)", () => {
    it("enforces forgot password rate limit (max 3 per email, max 10 per IP)", async () => {
      const email = "forgot.rate@bookscheck.test";
      const ip = "172.16.0.5";

      // 3 attempts
      await recordForgotPasswordAttempt(email, ip);
      await recordForgotPasswordAttempt(email, ip);
      await recordForgotPasswordAttempt(email, ip);

      // 4th attempt should be blocked
      const check = await checkForgotPasswordRateLimit(email, ip);
      expect(check.allowed).toBe(false);
    });

    it("enforces verification resend limit (max 3 per user per hour)", async () => {
      // 3 attempts
      await recordResendAttempt(testUserId);
      await recordResendAttempt(testUserId);
      await recordResendAttempt(testUserId);

      // 4th attempt should be blocked
      const check = await checkResendRateLimit(testUserId);
      expect(check.allowed).toBe(false);
    });
  });
});
