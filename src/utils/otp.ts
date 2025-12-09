/**
 * Generates numeric OTP(one-time password) string.
 * @param length number of digits to generate. default is 6
 * @returns numeric OTP string
 */
export async function genOTP(digits: number = 6): Promise<string> {
  const { randomInt } = await import("node:crypto");
  let otp = "";
  for (let i = 0; i < digits; i++) {
    otp += randomInt(10);
  }
  return otp;
}
