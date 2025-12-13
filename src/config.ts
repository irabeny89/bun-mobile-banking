export const DEFAULT_OTP_LENGTH = 6;
export const WORD_SEPARATOR = "-";
export const RATE_LIMIT_DEFAULT_TTL = 3600; // 1 hour in seconds
export const RATE_LIMIT_DEFAULT_LIMIT = 5e3; // 5k requests per hour
export const RATE_LIMIT_KEY = "ratelimit";
export const IS_PROD_ENV = process.env.NODE_ENV === "production";
export const SECRET_1 = process.env.SECRET_1 ?? "53Cu7eS3kr3Et";
export const SECRET_2 = process.env.SECRET_2 ?? "sEkU7E53Kr33t";
export const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL ?? "3600"; // 1h in seconds
export const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL ?? "604800"; // 7d in seconds
export const POSTGRES_URL = process.env.POSTGRES_URL ?? "localhost:5432/fmb";
export const VALKEY_URL = process.env.VALKEY_URL ?? "redis://localhost:6379";
export const OTP_TTL = 60 * 15 // 15m in seconds
export const REGISTER_CACHE_KEY = "register"
export const REFRESH_TOKEN_CACHE_KEY = "refresh-token"
export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Fluxus <fluxus@ethereal.email>"
export const CACHE_GET = {
    ttl: 10 as const, // 10s
    header: "x-cache",
}
