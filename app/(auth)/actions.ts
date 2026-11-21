"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { signUpSchema, loginSchema } from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/hash";
import {
  createSession,
  setSessionCookie,
  destroySession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import {
  checkSignUpRateLimit,
  recordSignUpAttempt,
  checkLoginRateLimit,
  recordLoginFailure,
  checkForgotPasswordRateLimit,
  recordForgotPasswordAttempt,
  checkResendRateLimit,
  recordResendAttempt,
} from "@/lib/auth/rate-limit";
import {
  createEmailVerificationToken,
  createPasswordResetToken,
  hashToken,
} from "@/lib/auth/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { verifyOrigin, getClientIp } from "@/lib/auth/origin";
import { getCurrentUser } from "@/lib/auth/guard";

export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
}

/**
 * Sign Up Server Action (PRD 6.1, FR-1 to FR-8)
 */
export async function signUpAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // Capture cookieStore immediately in request scope before any native async operations
  const cookieStore = await cookies();

  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const clientIp = await getClientIp();
  const rateLimit = await checkSignUpRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many sign up attempts. Please try again later." };
  }

  await recordSignUpAttempt(clientIp);

  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    terms: formData.get("terms") === "on" || formData.get("terms") === "true",
  };

  const parseResult = signUpSchema.safeParse(rawData);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Validation failed.",
      fieldErrors,
    };
  }

  const { fullName, email, password } = parseResult.data;

  // Check email uniqueness (FR-4)
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: "An account with this email already exists.",
      fieldErrors: { email: "An account with this email already exists." },
    };
  }

  const passwordHash = await hashPassword(password);

  let newUserId: string;
  let rawToken: string;

  try {
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
      },
    });

    newUserId = user.id;
    rawToken = await createEmailVerificationToken(newUserId, email);
  } catch {
    return {
      success: false,
      error: "Something went wrong creating your account. Try again.",
    };
  }

  // Create session and set cookie on the captured cookieStore (FR-7)
  const token = await createSession(newUserId);
  await setSessionCookie(token, cookieStore);

  // Dispatch verification email in background without blocking
  sendVerificationEmail(email, rawToken).catch((err) => {
    console.error("Failed to send verification email:", err);
  });

  redirect("/register-company");
}

/**
 * Log In Server Action (PRD 6.2, FR-10 to FR-13)
 */
export async function logInAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const cookieStore = await cookies();

  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const clientIp = await getClientIp();

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parseResult = loginSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Invalid input.",
    };
  }

  const { email, password } = parseResult.data;

  // Check lockout limits (FR-12)
  const rateLimit = await checkLoginRateLimit(email, clientIp);
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.message };
  }

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (!user) {
    await recordLoginFailure(email, clientIp);
    return { success: false, error: "Email or password is incorrect." };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    await recordLoginFailure(email, clientIp);
    return { success: false, error: "Email or password is incorrect." };
  }

  // Success: create session
  const token = await createSession(user.id);
  await setSessionCookie(token, cookieStore);

  if (!user.companyId) {
    redirect("/register-company");
  } else {
    redirect("/");
  }
}

/**
 * Log Out Server Action (PRD 6.2, FR-15)
 */
export async function logOutAction(): Promise<void> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    throw new Error("Invalid request origin.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await destroySession(token);
  }

  redirect("/login");
}

/**
 * Request Password Reset Action (PRD 6.3, FR-16)
 *
 * Always returns exact message: "If this email has an account, we sent a reset link."
 * Dispatches email via after() so timing does not leak account presence.
 */
export async function requestPasswordResetAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const clientIp = await getClientIp();
  const rawEmail = formData.get("email")?.toString() || "";
  const normalizedEmail = rawEmail.trim().toLowerCase();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  if (!isEmailValid) {
    return { success: false, error: "Enter a valid email address." };
  }

  // Rate limits: 3/hr per email, 10/hr per IP (FR-16)
  const rateLimit = await checkForgotPasswordRateLimit(normalizedEmail, clientIp);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many attempts. Try again in 15 minutes." };
  }

  await recordForgotPasswordAttempt(normalizedEmail, clientIp);

  // Background dispatch using Next.js after() (FR-16, rules/auth-and-security.md)
  after(async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user) {
        const rawToken = await createPasswordResetToken(user.id);
        await sendPasswordResetEmail(user.email, rawToken);
      }
    } catch (err) {
      console.error("Error in background password reset dispatch:", err);
    }
  });

  // Always return the exact same response and text (FR-16)
  return {
    success: true,
    message: "If this email has an account, we sent a reset link.",
  };
}

/**
 * Reset Password Server Action (PRD 6.3, FR-17 to FR-19)
 */
export async function resetPasswordAction(
  rawToken: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (password.length < 8 || password.length > 128) {
    return { success: false, error: "Use 8 to 128 characters." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!tokenRecord || tokenRecord.usedAt !== null || new Date() > tokenRecord.expiresAt) {
    return { success: false, error: "This link is invalid or has expired." };
  }

  const newHash = await hashPassword(password);
  const now = new Date();

  // In one transaction: update password, mark token used, and delete ALL existing sessions (FR-19)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: now },
    }),
    prisma.session.deleteMany({
      where: { userId: tokenRecord.userId },
    }),
  ]);

  redirect("/login?reset=success");
}

/**
 * Resend Verification Email Server Action (PRD FR-8)
 */
export async function resendVerificationAction(): Promise<ActionResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const auth = await getCurrentUser();
  if (!auth) {
    return { success: false, error: "You must be logged in." };
  }

  if (auth.user.emailVerifiedAt) {
    return { success: false, error: "Email is already verified." };
  }

  const rateLimit = await checkResendRateLimit(auth.user.id);
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many resend attempts. Try again in an hour." };
  }

  await recordResendAttempt(auth.user.id);

  const rawToken = await createEmailVerificationToken(auth.user.id, auth.user.email);

  after(async () => {
    await sendVerificationEmail(auth.user.email, rawToken);
  });

  return { success: true, message: "Verification email sent." };
}
