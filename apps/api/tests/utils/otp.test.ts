import { describe, expect, it } from "bun:test";
import { genOTP } from "@/utils/otp";

describe("genOTP", () => {
  it("should generate a valid otp with default length (6)", async () => {
    const otp = await genOTP();
    expect(otp.length).toBe(6);
    expect(otp).toMatch(/^\d+$/);
  });

  it("should generate a valid otp with specified length", async () => {
    const len = 4;
    const otp = await genOTP(len);
    expect(otp.length).toBe(len);
    expect(otp).toMatch(/^\d+$/);
  });

  it("should generate different otps on subsequent calls", async () => {
    const otp1 = await genOTP();
    const otp2 = await genOTP();
    // It is theoretically possible but highly unlikely to match 
    expect(otp1).not.toBe(otp2);
  });
});
