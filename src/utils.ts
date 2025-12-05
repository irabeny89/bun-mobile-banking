import { randomInt } from "node:crypto";
import { createTransport } from "nodemailer";

export function genOTP(length: number = 6): string {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += randomInt(10);
  }
  return otp;
}

export function sendEmail(html: string) {
  const transporter = createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "maddison53@ethereal.email",
      pass: "jn7jnAPss4f63QBp6D",
    },
  });
}

/**
 * Transform string to a suitable name for files by trimming and replace space between letters with hyphen.
 * @example "abc def" -> "abc-def"
 * @param suffix string to transform
 * @returns transformed string
 */
export const createFilename = (suffix: string) =>
  suffix.trim().replace(/\s+/g, () => "-");
