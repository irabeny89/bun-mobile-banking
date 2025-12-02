import { randomInt } from "node:crypto"

export const genOTP = (length: number = 6): string => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += randomInt(10);
  }
  return otp;
};
