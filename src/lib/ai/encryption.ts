/* ═══════════════════════════════════════════════════════════════
   AI Copilot — AES-256-GCM Encryption for API Keys
   
   Encrypts/decrypts API keys at rest using a secret derived from
   the AI_ENCRYPTION_SECRET environment variable. Keys are NEVER
   stored in plaintext, NEVER logged, NEVER returned in API responses.
   ═══════════════════════════════════════════════════════════════ */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
    const secret = process.env.AI_ENCRYPTION_SECRET;
    if (!secret) {
        throw new Error(
            "AI_ENCRYPTION_SECRET environment variable is required for API key encryption. " +
                "Generate one with: openssl rand -hex 32"
        );
    }
    return createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext API key using AES-256-GCM.
 * Returns a base64 string containing IV + ciphertext + auth tag.
 */
export function encryptApiKey(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([iv, encrypted, authTag]);
    return combined.toString("base64");
}

/**
 * Decrypt an encrypted API key from its base64 representation.
 */
export function decryptApiKey(encryptedBase64: string): string {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedBase64, "base64");

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
}

/**
 * Extract the last 4 characters of a key for display hint purposes.
 * This is safe to store and display in the UI.
 */
export function getKeyHint(plaintext: string): string {
    if (plaintext.length <= 4) return "****";
    return `****${plaintext.slice(-4)}`;
}
