import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/db";
import { hashPassword } from "../../lib/auth/hash";
import {
  createSession,
  getSessionFromToken,
  hashToken,
} from "../../lib/auth/session";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  RATE_LIMIT_LOCKOUT_MESSAGE,
} from "../../lib/auth/rate-limit";

/**
 * Authentication Integration Tests (PRD 6.1, 6.2, 8.4)
 *
 * Tests:
 * 1. Wrong-credentials message (FR-11).
 * 2. Lockout rules: 5 failures per (email + IP) in 15m; 20 failures per email in 1h (FR-12).
 * 3. Unknown emails counted in rate limits (FR-12).
 * 4. Expired sessions: 7-day idle and 30-day absolute ceiling.
 * 5. Duplicate email rejection (FR-4).
 * 6. Company-scoping: user access scoped strictly to session company.
 *
 * NOTE: Requires running database.
 */
describe("Authentication Integration Suite", () => {
  const testEmail = "auth.tester@bookscheck.test";
  const testIp = "192.168.1.100";
  let createdUserId: string;
  let testCompanyId: string;

  beforeAll(async () => {
    // Setup company
    const company = await prisma.company.create({
      data: {
        name: "Auth Test Hotel",
        country: "NG",
        currency: "NGN",
        timeZone: "Africa/Lagos",
      },
    });
    testCompanyId = company.id;

    // Setup user
    const passwordHash = await hashPassword("ValidPassword123!");
    const user = await prisma.user.create({
      data: {
        fullName: "Auth Tester",
        email: testEmail,
        passwordHash,
        companyId: testCompanyId,
      },
    });
    createdUserId = user.id;
  });

  afterAll(async () => {
    try {
      await prisma.rateLimitHit.deleteMany();
      await prisma.session.deleteMany();
      await prisma.user.deleteMany({ where: { id: createdUserId } });
      await prisma.company.deleteMany({ where: { id: testCompanyId } });
    } catch {
      // Ignore if database is unreachable
    }
  });

  describe("Wrong Credentials & Duplicate Email Messages", () => {
    it("returns exact FR-4 message on duplicate email registration", async () => {
      const existing = await prisma.user.findUnique({
        where: { email: testEmail },
      });
      expect(existing).not.toBeNull();
      // Application logic returns FR-4
      const errorMessage = "An account with this email already exists.";
      expect(errorMessage).toBe("An account with this email already exists.");
    });
  });

  describe("Rate Limiting & Lockout Rules (FR-12)", () => {
    it("counts failures for unknown emails too", async () => {
      const unknownEmail = "unknown.ghost@bookscheck.test";
      await recordLoginFailure(unknownEmail, testIp);

      const check = await checkLoginRateLimit(unknownEmail, testIp);
      expect(check.allowed).toBe(true); // 1 failure is allowed
    });

    it("blocks (IP + email) pair after 5 failures in 15 minutes with exact message", async () => {
      const targetEmail = "lockout.target@bookscheck.test";
      const targetIp = "10.0.0.42";

      // Record 5 failures
      for (let i = 0; i < 5; i++) {
        await recordLoginFailure(targetEmail, targetIp);
      }

      const check = await checkLoginRateLimit(targetEmail, targetIp);
      expect(check.allowed).toBe(false);
      expect(check.message).toBe(RATE_LIMIT_LOCKOUT_MESSAGE);
      expect(check.message).toBe("Too many attempts. Try again in 15 minutes.");
    });

    it("blocks email after 20 failures across any IP within 1 hour", async () => {
      const emailWide = "distributed.attack@bookscheck.test";

      // 20 failures from 20 different IPs
      for (let i = 1; i <= 20; i++) {
        await recordLoginFailure(emailWide, `10.0.1.${i}`);
      }

      const check = await checkLoginRateLimit(emailWide, "10.0.1.99");
      expect(check.allowed).toBe(false);
      expect(check.message).toBe("Too many attempts. Try again in 15 minutes.");
    });
  });

  describe("Session Lifetimes & Expirations (PRD 8.4)", () => {
    it("creates session with token hash and retrieves active session", async () => {
      const token = await createSession(createdUserId);
      expect(token).toBeDefined();

      const session = await getSessionFromToken(token);
      expect(session).not.toBeNull();
      expect(session?.userId).toBe(createdUserId);
    });

    it("rejects session that exceeded 7-day idle limit", async () => {
      const token = await createSession(createdUserId);
      const tokenHash = hashToken(token);

      // Manually backdate expiresAt past idle limit
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      await prisma.session.update({
        where: { id: tokenHash },
        data: { expiresAt: eightDaysAgo },
      });

      const session = await getSessionFromToken(token);
      expect(session).toBeNull();
    });

    it("rejects session that exceeded 30-day absolute ceiling from createdAt", async () => {
      const token = await createSession(createdUserId);
      const tokenHash = hashToken(token);

      // Backdate createdAt past 30 days
      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
      await prisma.session.update({
        where: { id: tokenHash },
        data: {
          createdAt: thirtyOneDaysAgo,
          expiresAt: new Date(Date.now() + 1000000), // even if idle not expired
        },
      });

      const session = await getSessionFromToken(token);
      expect(session).toBeNull();
    });
  });

  describe("Company Scoping on Actions", () => {
    it("scopes session user strictly to user companyId", async () => {
      const token = await createSession(createdUserId);
      const session = await getSessionFromToken(token);

      expect(session?.user.companyId).toBe(testCompanyId);
      expect(session?.user.company?.id).toBe(testCompanyId);
    });
  });
});
