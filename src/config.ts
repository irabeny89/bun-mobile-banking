export const DEFAULT_OTP_LENGTH = 6;
export const IS_PROD_ENV = Bun.env.NODE_ENV === "production";
export const SECRET_1 = Bun.env.SECRET_1 ?? "53Cu7eS3kr3Et";
export const SECRET_2 = Bun.env.SECRET_2 ?? "sEkU7E53Kr33t";
export const POSTGRES_URL = Bun.env.POSTGRES_URL ?? "localhost:5432/fmb";
export const WORD_SEPARATOR = "-";