import { createHash } from "crypto";
import { prisma } from "../db";

/**
 * Rate Limiting Engine (PRD FR-4, FR-8, FR-12, FR-16, rules/auth-and-security.md)
 *
 * Rules:
 * 1. Counter table: RateLimitHit.
 * 2. bucket holds SHA-256 hash of key (no raw email in database).
 * 3. Sign-up: 10 attempts per hour per IP.
 * 4. Verification resend: 3 per hour per user.
 * 5. Forgot password: 3 per hour per email, 10 per hour per IP.
 * 6. Login pair: 5 failures in 15 minutes for (IP + email) -> block 15 minutes.
 * 7. Login email: 20 failures in 1 hour for email from any IP -> block 15 minutes.
 * 8. Unknown emails count towards failures (prevents email enumeration).
 * 9. Message: "Too many attempts. Try again in 15 minutes." (FR-12)
 */

export const RATE_LIMIT_LOCKOUT_MESSAGE = "Too many attempts. Try again in 15 minutes.";

function hashBucketKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function recordRateLimitHit(key: string): Promise<void> {
  const bucket = hashBucketKey(key);
  await prisma.rateLimitHit.create({
    data: {
      bucket,
      createdAt: new Date(),
    },
  });
}

export async function countHitsSince(key: string, sinceDate: Date): Promise<number> {
  const bucket = hashBucketKey(key);
  return prisma.rateLimitHit.count({
    where: {
      bucket,
      createdAt: { gte: sinceDate },
    },
  });
}

/**
 * Checks sign-up rate limit: 10 attempts per hour per IP (FR-4).
 */
export async function checkSignUpRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await countHitsSince(`signup:ip:${ip}`, oneHourAgo);
  return { allowed: count < 10 };
}

export async function recordSignUpAttempt(ip: string): Promise<void> {
  await recordRateLimitHit(`signup:ip:${ip}`);
}

/**
 * Checks verification resend limit: 3 per hour per user (FR-8).
 */
export async function checkResendRateLimit(userId: string): Promise<{ allowed: boolean }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await countHitsSince(`resend:user:${userId}`, oneHourAgo);
  return { allowed: count < 3 };
}

export async function recordResendAttempt(userId: string): Promise<void> {
  await recordRateLimitHit(`resend:user:${userId}`);
}

/**
 * Checks forgot password rate limits: 3 per hour per email, 10 per hour per IP (FR-16).
 */
export async function checkForgotPasswordRateLimit(
  email: string,
  ip: string
): Promise<{ allowed: boolean }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const normalizedEmail = email.toLowerCase().trim();

  const [emailCount, ipCount] = await Promise.all([
    countHitsSince(`forgot_pw:email:${normalizedEmail}`, oneHourAgo),
    countHitsSince(`forgot_pw:ip:${ip}`, oneHourAgo),
  ]);

  return { allowed: emailCount < 3 && ipCount < 10 };
}

export async function recordForgotPasswordAttempt(email: string, ip: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  await Promise.all([
    recordRateLimitHit(`forgot_pw:email:${normalizedEmail}`),
    recordRateLimitHit(`forgot_pw:ip:${ip}`),
  ]);
}

/**
 * Checks login rate limits:
 * - Pair (email + IP): 5 failures in 15 minutes -> blocked.
 * - Email (any IP): 20 failures in 1 hour -> blocked.
 */
export async function checkLoginRateLimit(
  email: string,
  ip: string
): Promise<{ allowed: boolean; message?: string }> {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check pair limit: 5 failures within 15 minutes
  const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000);
  const pairCount = await countHitsSince(
    `login:pair:${normalizedEmail}:${ip}`,
    fifteenMinutesAgo
  );
  if (pairCount >= 5) {
    return { allowed: false, message: RATE_LIMIT_LOCKOUT_MESSAGE };
  }

  // 2. Check email-wide limit: 20 failures within 1 hour
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const emailCount = await countHitsSince(
    `login:email:${normalizedEmail}`,
    oneHourAgo
  );
  if (emailCount >= 20) {
    return { allowed: false, message: RATE_LIMIT_LOCKOUT_MESSAGE };
  }

  return { allowed: true };
}

export async function recordLoginFailure(email: string, ip: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  await Promise.all([
    recordRateLimitHit(`login:pair:${normalizedEmail}:${ip}`),
    recordRateLimitHit(`login:email:${normalizedEmail}`),
  ]);
}
