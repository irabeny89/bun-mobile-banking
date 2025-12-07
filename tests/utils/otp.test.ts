import { describe, expect, it } from "bun:test";
import { DEFAULT_OTP_LENGTH } from "../../src/config";
import { genOTP } from "@/utils/otp";

describe("utils", () => {
  describe("genOtp", () => {
    it("should generate a valid otp with given length", async () => {
      const len = 6;
      const otp = await genOTP(len);
      expect(otp.length).toBe(len);
      expect(otp).toMatch(/^\d+$/);
    });
    it("should generate a valid otp with default length", async () => {
      const otp = await genOTP();
      expect(otp.length).toBe(DEFAULT_OTP_LENGTH);
      expect(otp).toMatch(/^\d+$/);
    });
  });
});
