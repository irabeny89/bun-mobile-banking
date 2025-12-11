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
  }
}

export enum CACHE_GET_VALUE {
  Set = "set",
  Hit = "hit"
}