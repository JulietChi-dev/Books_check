import { describe, it, expect } from "vitest";
import { signUpSchema, loginSchema } from "../../lib/validations/auth";

/**
 * Unit Tests for Auth Zod Schemas (PRD 6.1, 6.2, validation-and-messages.md)
 */
describe("Auth Zod Schemas & PRD Error Messages", () => {
  describe("signUpSchema", () => {
    const validData = {
      fullName: "Jane Doe",
      email: "Jane.Doe@Example.com",
      password: "password123",
      confirmPassword: "password123",
      terms: true,
    };

    it("accepts valid input and transforms email to lowercase", () => {
      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("jane.doe@example.com");
      }
    });

    it("rejects invalid email with exact PRD message (FR-3)", () => {
      const result = signUpSchema.safeParse({
        ...validData,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path[0] === "email");
        expect(emailError?.message).toBe("Enter a valid email address.");
      }
    });

    it("rejects short password (< 8 chars) with exact PRD message (FR-5)", () => {
      const result = signUpSchema.safeParse({
        ...validData,
        password: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pwError = result.error.issues.find((i) => i.path[0] === "password");
        expect(pwError?.message).toBe("Use 8 to 128 characters.");
      }
    });

    it("rejects overly long password (> 128 chars) with exact PRD message (FR-5)", () => {
      const longPassword = "a".repeat(129);
      const result = signUpSchema.safeParse({
        ...validData,
        password: longPassword,
        confirmPassword: longPassword,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pwError = result.error.issues.find((i) => i.path[0] === "password");
        expect(pwError?.message).toBe("Use 8 to 128 characters.");
      }
    });

    it("rejects mismatched passwords with exact PRD message (FR-6)", () => {
      const result = signUpSchema.safeParse({
        ...validData,
        password: "password123",
        confirmPassword: "differentPassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const matchError = result.error.issues.find((i) => i.path[0] === "confirmPassword");
        expect(matchError?.message).toBe("Passwords do not match.");
      }
    });

    it("rejects unaccepted terms checkbox (FR-1)", () => {
      const result = signUpSchema.safeParse({
        ...validData,
        terms: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects short full name (< 2 chars) (FR-2)", () => {
      const result = signUpSchema.safeParse({
        ...validData,
        fullName: "A",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid email and password, converts email to lowercase", () => {
      const result = loginSchema.safeParse({
        email: "Manager@Hotel.com",
        password: "secretpassword",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("manager@hotel.com");
      }
    });

    it("rejects invalid email with exact PRD message (FR-3)", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "secretpassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Enter a valid email address.");
      }
    });
  });
});
