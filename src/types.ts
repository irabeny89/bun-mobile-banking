declare module "bun" {
  /**
   * Environment variable type definitions for Bun.
   */
  interface Env {
    SECRET_1: string;
    SECRET_2: string;
    MIG_FOLDER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_USER: string;
    POSTGRES_DB: string;
    POSTGRES_HOSTNAME: string;
    POSTGRES_PORT: string;
    POSTGRES_URL: string;
    VALKEY_HOSTNAME: string;
    VALKEY_PORT: string;
    VALKEY_URL: string;
    EMAIL_FROM: string;
    PORT: string;
  }
}

export enum CACHE_GET_VALUE {
  Set = "set",
  Hit = "hit"
}

export enum ERROR_RESPONSE_CODES {
  USER_EXIST = "USER_EXIST",
  NO_REGISTER_DATA = "NO_REGISTER_DATA",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_OTP = "INVALID_OTP",
  INVALID_TOKEN = "INVALID_TOKEN",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
}