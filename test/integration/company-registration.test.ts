import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/db";
import { hashPassword } from "../../lib/auth/hash";

/**
 * Company Registration Integration Tests (PRD 6.4, FR-20 to FR-27, write-rules.md)
 *
 * Tests:
 * 1. Rollback when one apartment is invalid: if any apartment fails, nothing saves.
 * 2. Duplicate names rollback: database unique index apartment_company_name_ci rejects case-insensitive duplicates.
 * 3. Tenant isolation: Company A and Company B can independently register identical apartment names.
 *
 * NOTE: Requires running database.
 */
describe("Company Registration Integration Suite", () => {
  let user1Id: string;
  let user2Id: string;
  const testCompanyIds: string[] = [];

  beforeAll(async () => {
    const pwHash = await hashPassword("Password123!");

    const u1 = await prisma.user.create({
      data: {
        fullName: "Company Reg User 1",
        email: "company.reg.user1@test.com",
        passwordHash: pwHash,
      },
    });
    user1Id = u1.id;

    const u2 = await prisma.user.create({
      data: {
        fullName: "Company Reg User 2",
        email: "company.reg.user2@test.com",
        passwordHash: pwHash,
      },
    });
    user2Id = u2.id;
  });

  afterAll(async () => {
    try {
      if (testCompanyIds.length > 0) {
        await prisma.apartment.deleteMany({ where: { companyId: { in: testCompanyIds } } });
        await prisma.company.deleteMany({ where: { id: { in: testCompanyIds } } });
      }
      await prisma.user.deleteMany({ where: { id: { in: [user1Id, user2Id] } } });
    } catch {
      // Ignore if DB is unreachable
    }
  });

  it("Rollback when one apartment is invalid: entire transaction aborts", async () => {
    let transactionFailed = false;

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Create company
        const company = await tx.company.create({
          data: {
            name: "Rollback Test Suites",
            country: "NG",
            currency: "NGN",
            timeZone: "Africa/Lagos",
          },
        });
        testCompanyIds.push(company.id);

        // 2. Link user
        await tx.user.update({
          where: { id: user1Id },
          data: { companyId: company.id },
        });

        // 3. Apartment 1: valid
        await tx.apartment.create({
          data: {
            companyId: company.id,
            name: "Valid Unit",
            roomCount: 2,
          },
        });

        // 4. Apartment 2: invalid room count (25 violates apartment_rooms_valid constraint)
        await tx.apartment.create({
          data: {
            companyId: company.id,
            name: "Invalid Unit",
            roomCount: 25,
          },
        });
      });
    } catch {
      transactionFailed = true;
    }

    expect(transactionFailed).toBe(true);

    // Verify complete rollback: no company created
    const companyInDb = await prisma.company.findFirst({
      where: { name: "Rollback Test Suites" },
    });
    expect(companyInDb).toBeNull();

    // Verify user remains without company
    const userInDb = await prisma.user.findUnique({
      where: { id: user1Id },
    });
    expect(userInDb?.companyId).toBeNull();
  });

  it("Duplicate apartment names in same company fail and rollback", async () => {
    let duplicateFailed = false;

    try {
      await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: "Duplicate Apt Hotel",
            country: "NG",
            currency: "NGN",
            timeZone: "Africa/Lagos",
          },
        });
        testCompanyIds.push(company.id);

        // First apartment
        await tx.apartment.create({
          data: {
            companyId: company.id,
            name: "Deluxe Suite",
            roomCount: 1,
          },
        });

        // Second apartment differing only by case -> triggers unique index apartment_company_name_ci
        await tx.apartment.create({
          data: {
            companyId: company.id,
            name: "deluxe suite",
            roomCount: 1,
          },
        });
      });
    } catch {
      duplicateFailed = true;
    }

    expect(duplicateFailed).toBe(true);
  });

  it("Isolation: two different companies can register identical apartment names", async () => {
    let comp1Id = "";
    let comp2Id = "";

    // Company 1 registers "Penthouse"
    const c1 = await prisma.company.create({
      data: {
        name: "Isolation Company 1",
        country: "NG",
        currency: "NGN",
        timeZone: "Africa/Lagos",
      },
    });
    comp1Id = c1.id;
    testCompanyIds.push(c1.id);

    await prisma.apartment.create({
      data: {
        companyId: c1.id,
        name: "Penthouse",
        roomCount: 3,
      },
    });

    // Company 2 registers identical name "Penthouse"
    const c2 = await prisma.company.create({
      data: {
        name: "Isolation Company 2",
        country: "NG",
        currency: "NGN",
        timeZone: "Africa/Lagos",
      },
    });
    comp2Id = c2.id;
    testCompanyIds.push(c2.id);

    const apt2 = await prisma.apartment.create({
      data: {
        companyId: c2.id,
        name: "Penthouse",
        roomCount: 4,
      },
    });

    expect(apt2.id).toBeDefined();
    expect(apt2.companyId).toBe(comp2Id);
    expect(comp1Id).not.toBe(comp2Id);
  });
});
