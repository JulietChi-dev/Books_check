import { scrypt, randomBytes, timingSafeEqual } from "crypto";

/**
 * Password Hashing (PRD 8.4 & rules/auth-and-security.md)
 *
 * Rules:
 * 1. Hash with Argon2id on Node runtime.
 * 2. If @node-rs/argon2 fails on Vercel or local environment, scrypt from node:crypto is used as fallback.
 * 3. Hashed formats:
 *    - Argon2id: standard `$argon2id$v=19$m=...` string
 *    - scrypt fallback: `scrypt:v1:<salt-hex>:<hash-hex>`
 */

// In @node-rs/argon2: 0 = Argon2d, 1 = Argon2i, 2 = Argon2id
const ARGON2ID_ALGORITHM = 2;

let argon2Module: typeof import("@node-rs/argon2") | null = null;
let argon2LoadAttempted = false;

async function getArgon2() {
  if (!argon2LoadAttempted) {
    argon2LoadAttempted = true;
    try {
      argon2Module = await import("@node-rs/argon2");
    } catch {
      argon2Module = null;
    }
  }
  return argon2Module;
}

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      keylen,
      { N: 16384, r: 8, p: 1 },
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey as Buffer);
      }
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const argon2 = await getArgon2();
  if (argon2) {
    try {
      return await argon2.hash(password, {
        algorithm: ARGON2ID_ALGORITHM,
      });
    } catch {
      // Fall through to scrypt fallback
    }
  }

  // Scrypt fallback (Node built-in crypto)
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, 64);

  return `scrypt:v1:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (hash.startsWith("scrypt:v1:")) {
    const [, , saltHex, hashHex] = hash.split(":");
    if (!saltHex || !hashHex) return false;

    const salt = Buffer.from(saltHex, "hex");
    const expectedHash = Buffer.from(hashHex, "hex");
    const derivedKey = await scryptAsync(password, salt, expectedHash.length);

    return timingSafeEqual(derivedKey, expectedHash);
  }

  const argon2 = await getArgon2();
  if (argon2) {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  return false;
}
