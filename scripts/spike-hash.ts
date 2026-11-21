import { hashPassword, verifyPassword } from "../lib/auth/hash";

async function runSpike() {
  console.log("=== BooksCheck Hashing Spike (Argon2id + scrypt) ===");

  const samplePassword = "CorrectHorseBatteryStaple123!";

  console.log("\n1. Testing Hashing...");
  const startTime = Date.now();
  const hash = await hashPassword(samplePassword);
  const duration = Date.now() - startTime;

  console.log(`Hash generated in ${duration}ms:`);
  console.log(hash);

  console.log("\n2. Testing Verification with Correct Password...");
  const isValid = await verifyPassword(samplePassword, hash);
  console.log(`Verification result: ${isValid ? "PASS" : "FAIL"}`);

  console.log("\n3. Testing Verification with Wrong Password...");
  const isInvalid = await verifyPassword("WrongPassword!", hash);
  console.log(`Rejection result: ${!isInvalid ? "PASS (Properly Rejected)" : "FAIL"}`);

  if (hash.startsWith("$argon2id$")) {
    console.log("\n[SUCCESS] Argon2id native library loaded and executed successfully.");
  } else if (hash.startsWith("scrypt:v1:")) {
    console.log("\n[INFO] Used built-in scrypt fallback from node:crypto.");
  } else {
    console.error("\n[ERROR] Unknown hash format generated.");
    process.exit(1);
  }
}

runSpike().catch((err) => {
  console.error("Spike failed with error:", err);
  process.exit(1);
});
