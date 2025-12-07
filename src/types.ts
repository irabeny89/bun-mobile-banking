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
    
  }
}
