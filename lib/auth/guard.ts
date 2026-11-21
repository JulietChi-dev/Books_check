import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getSessionFromToken } from "./session";

/**
 * Server-Side Session Guard (PRD 8.2, FR-87, rules/security-baseline.md)
 *
 * Checks session on the server in every page, action, and query.
 * Takes companyId strictly from the session user.
 */

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await getSessionFromToken(token);
  if (!session) {
    return null;
  }

  return {
    session,
    user: session.user,
    company: session.user.company,
  };
}

export async function requireSession() {
  const auth = await getCurrentUser();
  if (!auth) {
    throw new Error("UNAUTHORIZED");
  }
  return auth;
}
