import { headers } from "next/headers";

/**
 * Origin Header Verification (PRD 8.4, rules/auth-and-security.md)
 *
 * Verifies that the Origin header matches the Host header on state-changing requests.
 * Rejects mismatch to prevent CSRF attempts across different origins.
 *
 * Rules:
 * - Next.js Server Actions carry built-in CSRF protection (PRD 8.4).
 * - If Origin is present and valid, it must match the Host.
 * - If Origin is absent, "null", or headers() is unavailable, allows same-origin requests.
 */
export async function verifyOrigin(): Promise<boolean> {
  try {
    const headerList = await headers();
    const origin = headerList.get("origin");
    const host = headerList.get("host") || headerList.get("x-forwarded-host");

    if (!origin || origin === "null") {
      return true;
    }

    if (!host) {
      return false;
    }

    try {
      const originUrl = new URL(origin);
      return originUrl.host === host;
    } catch {
      return false;
    }
  } catch {
    // If headers() throws or is unavailable in the execution context, allow the built-in
    // Next.js Server Action CSRF mechanism and SameSite cookies to protect the action.
    return true;
  }
}

/**
 * Extracts client IP from request headers (x-forwarded-for, x-real-ip).
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      const firstIp = forwarded.split(",")[0].trim();
      if (firstIp) return firstIp;
    }

    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp.trim();
  } catch {
    // Fall back to loopback IP if headers() is unavailable
  }

  return "127.0.0.1";
}
