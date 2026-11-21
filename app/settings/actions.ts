"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth/guard";
import { verifyOrigin } from "@/lib/auth/origin";
import { verifyPassword, hashPassword } from "@/lib/auth/hash";
import { SESSION_COOKIE_NAME, hashToken } from "@/lib/auth/session";
import { generateToken } from "@/lib/auth/tokens";
import { sendChangeEmailVerification } from "@/lib/email";
import {
  companyRegistrationSchema,
  apartmentRowSchema,
  checkDuplicateApartmentNames,
  normalizePhone,
} from "@/lib/validations/company";
import { z } from "zod";

export interface SettingsResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// FR-80: Update Company Details
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update Company action (PRD FR-80, FR-25, FR-88)
 * Currency is editable only while the company has no bookings (FR-25).
 */
export async function updateCompanyAction(
  _prevState: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) return { success: false, error: "Invalid request origin." };

  const auth = await requireSession();
  const companyId = auth.user.companyId;
  if (!companyId) redirect("/register-company");

  // Parse and validate
  const rawData = {
    name:     formData.get("name")?.toString() ?? "",
    country:  formData.get("country")?.toString() ?? "NG",
    currency: formData.get("currency")?.toString() ?? "NGN",
    timeZone: formData.get("timeZone")?.toString() ?? "Africa/Lagos",
    address:  formData.get("address")?.toString() ?? "",
    city:     formData.get("city")?.toString() ?? "",
    phone:    formData.get("phone")?.toString() ?? "",
    email:    formData.get("email")?.toString() ?? "",
    // apartments not needed for update
    apartments: [],
  };

  // Use a subset schema — apartments not required for update
  const schema = companyRegistrationSchema.omit({ apartments: true });
  const result = schema.safeParse(rawData);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { success: false, error: result.error.issues[0]?.message, fieldErrors };
  }

  const data = result.data;

  // Normalize optional phone
  let normalizedPhone: string | null = null;
  if (data.phone) {
    try {
      normalizedPhone = normalizePhone(data.phone);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid phone number.";
      return { success: false, error: msg, fieldErrors: { phone: msg } };
    }
  }

  // FR-25: Currency editable only while no bookings exist
  const existingCompany = await prisma.company.findUnique({ where: { id: companyId } });
  if (!existingCompany) return { success: false, error: "Company not found." };

  let currencyToSave = existingCompany.currency;
  if (data.currency !== existingCompany.currency) {
    const bookingCount = await prisma.booking.count({ where: { companyId } });
    if (bookingCount > 0) {
      return {
        success: false,
        error: "Currency cannot be changed once bookings exist.",
        fieldErrors: { currency: "Currency cannot be changed once bookings exist." },
      };
    }
    currencyToSave = data.currency;
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      name:     data.name,
      country:  data.country,
      currency: currencyToSave,
      timeZone: data.timeZone,
      address:  data.address || null,
      city:     data.city || null,
      phone:    normalizedPhone,
      email:    data.email || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// FR-81: Rename Apartment / Change Room Count
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update Apartment action (PRD FR-81, FR-86)
 * Renaming does not change bookings — bookings link by ID (FR-86).
 */
export async function updateApartmentAction(
  _prevState: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) return { success: false, error: "Invalid request origin." };

  const auth = await requireSession();
  const companyId = auth.user.companyId;
  if (!companyId) redirect("/register-company");

  const apartmentId = formData.get("apartmentId")?.toString() ?? "";
  if (!apartmentId) return { success: false, error: "Apartment ID is required." };

  const result = apartmentRowSchema.safeParse({
    name:      formData.get("name")?.toString() ?? "",
    roomCount: formData.get("roomCount")?.toString() ?? "",
  });
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { success: false, error: result.error.issues[0]?.message, fieldErrors };
  }

  // Confirm apartment belongs to this company
  const apt = await prisma.apartment.findFirst({ where: { id: apartmentId, companyId } });
  if (!apt) return { success: false, error: "Apartment not found." };

  // FR-23: Check name uniqueness (case-insensitive) among OTHER apartments
  const others = await prisma.apartment.findMany({
    where: { companyId, id: { not: apartmentId } },
    select: { name: true },
  });
  const duplicateCheck = checkDuplicateApartmentNames([
    { name: result.data.name },
    ...others,
  ]);
  if (duplicateCheck.hasDuplicates && duplicateCheck.duplicateName?.toLowerCase() === result.data.name.toLowerCase()) {
    return {
      success: false,
      error: `Two apartments share the name '${result.data.name}'.`,
      fieldErrors: { name: `Two apartments share the name '${result.data.name}'.` },
    };
  }

  await prisma.apartment.update({
    where: { id: apartmentId },
    data: { name: result.data.name.trim(), roomCount: result.data.roomCount },
  });

  revalidatePath("/settings");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// FR-82: Add Apartment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create Apartment action (PRD FR-82)
 * Maximum 50 apartments per company.
 */
export async function createApartmentAction(
  _prevState: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) return { success: false, error: "Invalid request origin." };

  const auth = await requireSession();
  const companyId = auth.user.companyId;
  if (!companyId) redirect("/register-company");

  const result = apartmentRowSchema.safeParse({
    name:      formData.get("name")?.toString() ?? "",
    roomCount: formData.get("roomCount")?.toString() ?? "",
  });
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { success: false, error: result.error.issues[0]?.message, fieldErrors };
  }

  // Check 50-apartment limit (FR-82)
  const count = await prisma.apartment.count({ where: { companyId } });
  if (count >= 50) {
    return { success: false, error: "You cannot have more than 50 apartments." };
  }

  // FR-23: Name uniqueness
  const existing = await prisma.apartment.findMany({
    where: { companyId },
    select: { name: true },
  });
  const dupCheck = checkDuplicateApartmentNames([{ name: result.data.name }, ...existing]);
  if (dupCheck.hasDuplicates) {
    return {
      success: false,
      error: dupCheck.message,
      fieldErrors: { name: dupCheck.message ?? "Duplicate name." },
    };
  }

  await prisma.apartment.create({
    data: { companyId, name: result.data.name.trim(), roomCount: result.data.roomCount },
  });

  revalidatePath("/settings");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// FR-83: Delete Apartment (only when no bookings of any status)
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteApartmentAction(
  apartmentId: string
): Promise<SettingsResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) return { success: false, error: "Invalid request origin." };

  const auth = await requireSession();
  const companyId = auth.user.companyId;
  if (!companyId) redirect("/register-company");

  const apt = await prisma.apartment.findFirst({ where: { id: apartmentId, companyId } });
  if (!apt) return { success: false, error: "Apartment not found." };

  // FR-83: Can only remove an apartment that has no bookings of any status
  const bookingCount = await prisma.booking.count({ where: { apartmentId, companyId } });
  if (bookingCount > 0) {
    return {
      success: false,
      error: `Cannot remove "${apt.name}" — it has ${bookingCount} booking${bookingCount !== 1 ? "s" : ""}. Cancel and delete all bookings first.`,
    };
  }

  await prisma.apartment.delete({ where: { id: apartmentId } });
  revalidatePath("/settings");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// FR-84: Change Password
// ─────────────────────────────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword:     z.string().min(8, "Use 8 to 128 characters.").max(128, "Use 8 to 128 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/**
 * Change Password action (PRD FR-84)
 * Ends all OTHER sessions for the user after a successful change.
 */
export async function changePasswordAction(
  _prevState: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const cookieStore = await cookies(); // capture before any async work
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) return { success: false, error: "Invalid request origin." };

  const auth = await requireSession();
  const userId = auth.user.id;

  const result = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword")?.toString() ?? "",
    newPassword:     formData.get("newPassword")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
  });
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { success: false, error: result.error.issues[0]?.message, fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found." };

  const passwordOk = await verifyPassword(result.data.currentPassword, user.passwordHash);
  if (!passwordOk) {
    return {
      success: false,
      error: "Current password is incorrect.",
      fieldErrors: { currentPassword: "Current password is incorrect." },
    };
  }

  const newHash = await hashPassword(result.data.newPassword);

  // Get current session ID to keep it alive
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const currentSessionId = rawToken ? hashToken(rawToken) : null;

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } }),
    // FR-84: All OTHER sessions end
    prisma.session.deleteMany({
      where: {
        userId,
        ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
      },
    }),
  ]);

  revalidatePath("/settings");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// FR-85: Change Login Email (start — sends verification to new address)
// ─────────────────────────────────────────────────────────────────────────────

const changeEmailSchema = z.object({
  newEmail:        z.string().trim().email("Enter a valid email address.").transform((e) => e.toLowerCase()),
  currentPassword: z.string().min(1, "Current password is required."),
});

/**
 * Change Email action (PRD FR-85)
 * Requires current password. Sends a verification link to the NEW address.
 * Old address stays active until the new one is verified.
 */
export async function changeEmailAction(
  _prevState: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) return { success: false, error: "Invalid request origin." };

  const auth = await requireSession();
  const userId = auth.user.id;

  const result = changeEmailSchema.safeParse({
    newEmail:        formData.get("newEmail")?.toString() ?? "",
    currentPassword: formData.get("currentPassword")?.toString() ?? "",
  });
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { success: false, error: result.error.issues[0]?.message, fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found." };

  const passwordOk = await verifyPassword(result.data.currentPassword, user.passwordHash);
  if (!passwordOk) {
    return {
      success: false,
      error: "Current password is incorrect.",
      fieldErrors: { currentPassword: "Current password is incorrect." },
    };
  }

  if (result.data.newEmail === user.email) {
    return {
      success: false,
      error: "New email is the same as the current email.",
      fieldErrors: { newEmail: "New email is the same as the current email." },
    };
  }

  // Check if the new email is already taken by another account
  const taken = await prisma.user.findUnique({ where: { email: result.data.newEmail } });
  if (taken) {
    return {
      success: false,
      error: "An account with this email already exists.",
      fieldErrors: { newEmail: "An account with this email already exists." },
    };
  }

  // Create a CHANGE_EMAIL token (24-hour expiry, same mechanism as verify-email)
  const { rawToken, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailToken.create({
    data: {
      kind:      "CHANGE_EMAIL",
      email:     result.data.newEmail,
      tokenHash,
      userId,
      expiresAt,
    },
  });

  // Send verification email to the NEW address
  sendChangeEmailVerification(result.data.newEmail, rawToken).catch((err) =>
    console.error("Change email dispatch error:", err)
  );

  return {
    success: true,
    error: undefined,
  };
}
