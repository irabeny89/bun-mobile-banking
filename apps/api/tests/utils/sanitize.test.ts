import { describe, expect, it } from "bun:test";
import { sanitize } from "../../src/utils/sanitize";

describe("Sanitize Utility", () => {
    it("should sanitize strings containing XSS attacks", () => {
        const input = "<script>alert('XSS')</script>";
        const result = sanitize(input);
        expect(result).not.toContain("<script>");
        expect(result).toBe("&lt;script&gt;alert('XSS')&lt;/script&gt;");
    });

    it("should return safe strings unchanged", () => {
        const input = "Hello World";
        const result = sanitize(input);
        expect(result).toBe(input);
    });

    it("should sanitize arrays recursively", () => {
        const input = ["Valid", "<script>alert('XSS')</script>", "Another valid"];
        const result = sanitize(input);
        expect(result[0]).toBe("Valid");
        expect(result[1]).toBe("&lt;script&gt;alert('XSS')&lt;/script&gt;");
        expect(result[2]).toBe("Another valid");
    });

    it("should sanitize objects recursively", () => {
        const input = {
            name: "John",
            bio: "<b>Bold</b> <script>malicious()</script>"
        };
        const result = sanitize(input);
        expect(result.name).toBe("John");
        expect(result.bio).toBe("<b>Bold</b> &lt;script&gt;malicious()&lt;/script&gt;");
    });

    it("should sanitize nested structures (arrays in objects)", () => {
        const input = {
            tags: ["safe", "<img src=x onerror=alert(1)>"]
        };
        const result = sanitize(input);
        expect(result.tags[0]).toBe("safe");
        expect(result.tags[1]).toBe("<img src>");
    });

    it("should sanitize nested structures (objects in arrays)", () => {
        const input = [
            { id: 1, text: "safe" },
            { id: 2, text: "<iframe onload=alert(1)></iframe>" }
        ];
        const result = sanitize(input);
        expect(result[0].text).toBe("safe");
        expect(result[1].text).toBe("&lt;iframe onload=alert(1)&gt;&lt;/iframe&gt;"); // xss module behavior varies, checking essentially for sanitization
    });

    it("should return numbers unchanged", () => {
        const input = 12345;
        const result = sanitize(input);
        expect(result).toBe(input);
    });

    it("should return booleans unchanged", () => {
        const input = true;
        const result = sanitize(input);
        expect(result).toBe(input);
    });

    it("should return null unchanged", () => {
        const input = null;
        const result = sanitize(input);
        expect(result).toBe(input);
    });
});
