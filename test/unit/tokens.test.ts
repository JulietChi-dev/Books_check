import { describe, it, expect } from "vitest";
import { generateToken, hashToken } from "../../lib/auth/tokens";

describe("Token Engine Unit Tests (PRD 8.4)", () => {
  it("generates 32-byte cryptographically random token with SHA-256 hash", () => {
    const { rawToken, tokenHash } = generateToken();

    // 32 bytes hex = 64 hex characters
    expect(rawToken).toHaveLength(64);
    expect(tokenHash).toHaveLength(64);

    // Verify hash matches
    expect(hashToken(rawToken)).toBe(tokenHash);
  });

  it("produces unique tokens on successive calls", () => {
    const token1 = generateToken();
    const token2 = generateToken();

    expect(token1.rawToken).not.toBe(token2.rawToken);
    expect(token1.tokenHash).not.toBe(token2.tokenHash);
  });

  it("deterministic SHA-256 hashing", () => {
    const raw = "abc123fixedrawtokenforunittestingpurpose00000000000000000000000000";
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);

    expect(hash1).toBe(hash2);
  });
});
