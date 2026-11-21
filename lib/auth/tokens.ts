import { randomBytes, createHash } from "crypto";
import { prisma } from "../db";

/**
 * Hashed One-Use Token Engine (PRD FR-8, FR-17, 8.4)
 *
 * Rules:
 * 1. 32-byte cryptographically secure random token.
 * 2. Store only the SHA-256 hash in the database.
 * 3. Verification link expires after 24 hours (FR-8).
 * 4. Password reset link expires after 60 minutes and works once (FR-17).
 */

const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 60 minutes

export function generateToken(): { rawToken: string; tokenHash: string } {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates a 24-hour verification token.
 */
export async function createEmailVerificationToken(userId: string, email: string): Promise<string> {
  const { rawToken, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS);

  await prisma.emailToken.create({
    data: {
      kind: "VERIFY_EMAIL",
      email,
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return rawToken;
}

/**
 * Validates and consumes an email verification token (VERIFY_EMAIL or CHANGE_EMAIL).
 */
export async function consumeEmailVerificationToken(
  rawToken: string
): Promise<{ success: boolean; error?: string; userId?: string; kind?: string }> {
  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.emailToken.findUnique({
    where: { tokenHash },
  });

  if (!tokenRecord) {
    return { success: false, error: "This link is invalid or has expired." };
  }

  if (tokenRecord.usedAt !== null) {
    return { success: false, error: "This link has already been used." };
  }

  if (new Date() > tokenRecord.expiresAt) {
    return { success: false, error: "This link is invalid or has expired." };
  }

  const now = new Date();

  // If this was a CHANGE_EMAIL token, update the user's login email and mark it verified (FR-85)
  if (tokenRecord.kind === "CHANGE_EMAIL") {
    await prisma.$transaction([
      prisma.emailToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: now },
      }),
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          email: tokenRecord.email,
          emailVerifiedAt: now,
        },
      }),
    ]);
  } else {
    // Normal email verification
    await prisma.$transaction([
      prisma.emailToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: now },
      }),
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerifiedAt: now },
      }),
    ]);
  }

  return { success: true, userId: tokenRecord.userId, kind: tokenRecord.kind };
}

/**
 * Creates a 60-minute password reset token.
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const { rawToken, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return rawToken;
}

/**
 * Validates a password reset token without consuming it (used to render form).
 */
export async function validatePasswordResetToken(
  rawToken: string
): Promise<{ valid: boolean; tokenRecordId?: string; userId?: string }> {
  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!tokenRecord || tokenRecord.usedAt !== null || new Date() > tokenRecord.expiresAt) {
    return { valid: false };
  }

  return { valid: true, tokenRecordId: tokenRecord.id, userId: tokenRecord.userId };
}
