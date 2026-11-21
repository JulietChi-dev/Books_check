import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "../db";

/**
 * Session Management (PRD 8.4, rules/auth-and-security.md)
 *
 * Rules:
 * 1. 32-byte cryptographically random token.
 * 2. Store SHA-256 hash in Session.id. Database leak gives no usable tokens.
 * 3. Send raw token in HttpOnly, Secure, SameSite=Lax cookie: "bookscheck_session".
 * 4. 7-day idle expiry, 30-day absolute ceiling from createdAt.
 * 5. Update lastSeenAt at most once per hour.
 * 6. Logout immediately destroys the Session row.
 */

import { SESSION_COOKIE_NAME, IDLE_EXPIRY_DAYS, ABSOLUTE_EXPIRY_DAYS } from "./constants";
export { SESSION_COOKIE_NAME };
const IDLE_EXPIRY_MS = IDLE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days
const ABSOLUTE_EXPIRY_MS = ABSOLUTE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 30 days
const HOURLY_UPDATE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string, deviceClass?: string | null): Promise<string> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + IDLE_EXPIRY_MS);

  await prisma.session.create({
    data: {
      id: tokenHash,
      userId,
      expiresAt,
      lastSeenAt: now,
      deviceClass: deviceClass ?? null,
      createdAt: now,
    },
  });

  return token;
}

export async function setSessionCookie(
  token: string,
  providedCookieStore?: Awaited<ReturnType<typeof cookies>>
): Promise<void> {
  const cookieStore = providedCookieStore ?? (await cookies());
  // Secure cookies require HTTPS; over plain http://localhost the browser drops secure cookies.
  const isHttps = process.env.APP_URL?.startsWith("https://") ?? false;
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days maximum
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function destroySession(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  try {
    await prisma.session.delete({
      where: { id: tokenHash },
    });
  } catch {
    // Session might already be removed
  }
  await clearSessionCookie();
}

export async function getSessionFromToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { id: tokenHash },
    include: {
      user: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  const now = new Date();

  // Check 1: 30-day absolute ceiling from createdAt
  const absoluteExpiry = new Date(session.createdAt.getTime() + ABSOLUTE_EXPIRY_MS);
  if (now > absoluteExpiry) {
    await prisma.session.delete({ where: { id: tokenHash } }).catch(() => {});
    return null;
  }

  // Check 2: 7-day idle expiry
  if (now > session.expiresAt) {
    await prisma.session.delete({ where: { id: tokenHash } }).catch(() => {});
    return null;
  }

  // Check 3: Update lastSeenAt at most once per hour
  const timeSinceLastSeen = now.getTime() - session.lastSeenAt.getTime();
  if (timeSinceLastSeen > HOURLY_UPDATE_THRESHOLD_MS) {
    // Calculate new idle expiry (7 days from now), capped at absoluteExpiry
    let newExpiresAt = new Date(now.getTime() + IDLE_EXPIRY_MS);
    if (newExpiresAt > absoluteExpiry) {
      newExpiresAt = absoluteExpiry;
    }

    await prisma.session.update({
      where: { id: tokenHash },
      data: {
        lastSeenAt: now,
        expiresAt: newExpiresAt,
      },
    }).catch(() => {});
  }

  return session;
}
