import { describe, expect, it } from "bun:test";
import { encrypt, decrypt } from "@/utils/encryption";

describe("Encryption Utils", () => {
    it("should encrypt and decrypt a string correctly", () => {
        const original = "Hello World 123!";
        const encrypted = encrypt(original);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(original);
    });

    it("should generate different ciphertexts for the same input", () => {
        const text = "Secret Message";
        const encrypted1 = encrypt(text);
        const encrypted2 = encrypt(text);
        expect(encrypted1).not.toBe(encrypted2);
    });

    it("should return a string in format iv:content", () => {
        const text = "test";
        const encrypted = encrypt(text);
        expect(encrypted).toContain(":");
        const parts = encrypted.split(":");
        expect(parts.length).toBe(2);
        // IV is 16 bytes = 32 hex chars
        expect(parts[0].length).toBe(32);
    });

    it("should throw error for invalid format", () => {
        expect(() => decrypt("invalidformat")).toThrow("Invalid encrypted text format");
    });

    it("should handle empty string", () => {
        const original = "";
        const encrypted = encrypt(original);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(original);
    });

    it("should handle special characters", () => {
        const original = "🎉🚀🔥 @#%&";
        const encrypted = encrypt(original);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(original);
    });
});
