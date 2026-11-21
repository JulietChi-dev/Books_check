"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  companyRegistrationSchema,
  checkDuplicateApartmentNames,
  normalizePhone,
  ApartmentRowInput,
} from "@/lib/validations/company";
import { requireSession } from "@/lib/auth/guard";
import { verifyOrigin } from "@/lib/auth/origin";

export interface RegisterCompanyResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Register Company Server Action (PRD 6.4, FR-20 to FR-27, write-rules.md)
 *
 * Saves company and all apartments in ONE database transaction.
 * If any step fails, nothing saves.
 */
export async function registerCompanyAction(
  _prevState: RegisterCompanyResult | null,
  formData: FormData
): Promise<RegisterCompanyResult> {
  const isOriginValid = await verifyOrigin();
  if (!isOriginValid) {
    return { success: false, error: "Invalid request origin." };
  }

  const auth = await requireSession();
  const userId = auth.user.id;

  // If user already has a company, redirect to Home (FR-14)
  if (auth.user.companyId) {
    redirect("/");
  }

  // Parse raw form data
  const rawApartmentsJson = formData.get("apartmentsJson")?.toString() || "[]";
  let parsedApartments: ApartmentRowInput[] = [];

  try {
    parsedApartments = JSON.parse(rawApartmentsJson);
  } catch {
    return { success: false, error: "Invalid apartments list." };
  }

  const rawPhone = formData.get("phone")?.toString() || "";
  let normalizedPhone: string | null = null;
  if (rawPhone.trim()) {
    try {
      normalizedPhone = normalizePhone(rawPhone);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid phone number.";
      return { success: false, error: message, fieldErrors: { phone: message } };
    }
  }

  const rawData = {
    name: formData.get("name")?.toString() || "",
    country: formData.get("country")?.toString() || "NG",
    currency: formData.get("currency")?.toString() || "NGN",
    timeZone: formData.get("timeZone")?.toString() || "Africa/Lagos",
    address: formData.get("address")?.toString() || "",
    city: formData.get("city")?.toString() || "",
    phone: rawPhone.trim() ? rawPhone : undefined,
    email: formData.get("email")?.toString() || undefined,
    apartments: parsedApartments,
  };

  const validation = companyRegistrationSchema.safeParse(rawData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Validation failed.",
      fieldErrors,
    };
  }

  const data = validation.data;

  // Duplicate apartment name check ignoring case (FR-23)
  const duplicateCheck = checkDuplicateApartmentNames(data.apartments);
  if (duplicateCheck.hasDuplicates) {
    return {
      success: false,
      error: duplicateCheck.message,
      fieldErrors: { apartments: duplicateCheck.message || "Duplicate apartment name." },
    };
  }

  // Create Company, User link, and Apartments in ONE transaction (FR-24)
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create company
      const company = await tx.company.create({
        data: {
          name: data.name,
          country: data.country,
          currency: data.currency,
          timeZone: data.timeZone,
          address: data.address || null,
          city: data.city || null,
          phone: normalizedPhone,
          email: data.email || null,
        },
      });

      // 2. Link user to company
      await tx.user.update({
        where: { id: userId },
        data: { companyId: company.id },
      });

      // 3. Create all apartments
      await tx.apartment.createMany({
        data: data.apartments.map((apt) => ({
          companyId: company.id,
          name: apt.name.trim(),
          roomCount: apt.roomCount,
        })),
      });
    });
  } catch (err: unknown) {
    console.error("Company registration transaction failed:", err);
    return {
      success: false,
      error: "Could not complete company registration. Please try again.",
    };
  }

  // Redirect to Home calendar (FR-27)
  redirect("/");
}
