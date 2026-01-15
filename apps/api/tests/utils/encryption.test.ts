import { describe, expect, it } from "bun:test";
import { encrypt, decrypt } from "@/utils/encryption";

describe("Encryption Utils", () => {
    it("should encrypt and decrypt a string correctly", () => {
        const original = "Hello World 123!";
        const encrypted = encrypt(Buffer.from(original));
        const decrypted = decrypt(encrypted);
        expect(decrypted.toString()).toBe(original);
    });

    it("should generate different ciphertexts for the same input", () => {
        const text = "Secret Message";
        const encrypted1 = encrypt(Buffer.from(text));
        const encrypted2 = encrypt(Buffer.from(text));
        expect(encrypted1.toString()).not.toBe(encrypted2.toString());
    });

    it("should handle empty string", () => {
        const original = "";
        const encrypted = encrypt(Buffer.from(original));
        const decrypted = decrypt(encrypted);
        expect(decrypted.toString()).toBe(original);
    });

    it("should handle special characters", () => {
        const original = "🎉🚀🔥 @#%&";
        const encrypted = encrypt(Buffer.from(original));
        const decrypted = decrypt(encrypted);
        expect(decrypted.toString()).toBe(original);
    });
});
