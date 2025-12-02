import { describe, expect, it } from "bun:test";
import { DEFAULT_OTP_LENGTH } from "../src/config";
import { genOTP } from "../src/utils";

describe("utils", () => {
	describe("genOtp", () => {
		it("should generate a valid otp with given length", () => {
			const len = 6;
			const otp = genOTP(len);
			expect(otp.length).toBe(len);
			expect(otp).toMatch(/^\d+$/);
		});
		it("should generate a valid otp with default length", () => {
			const otp = genOTP();
			expect(otp.length).toBe(DEFAULT_OTP_LENGTH);
			expect(otp).toMatch(/^\d+$/);
		});
	});
});
