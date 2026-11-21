import { z } from "zod";

/**
 * Shared Auth Zod Schemas (PRD 6.1, 6.2, validation-and-messages.md)
 * Exact PRD Error Messages:
 * - Invalid email: "Enter a valid email address." (FR-3)
 * - Password length: "Use 8 to 128 characters." (FR-5)
 * - Password mismatch: "Passwords do not match." (FR-6)
 */

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(80, "Full name cannot exceed 80 characters."),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .transform((val) => val.toLowerCase()),
    password: z
      .string()
      .min(8, "Use 8 to 128 characters.")
      .max(128, "Use 8 to 128 characters."),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and privacy notice." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((val) => val.toLowerCase()),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;
