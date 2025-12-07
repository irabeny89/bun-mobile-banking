import { POSTGRES_URL } from "@/config";
/**
 * Initializes/Retrieves the Bun SQL database connection as a singleton.
 * @param url Connection string for the PostgreSQL database. Defaults to POSTGRES_URL from config.
 * @returns Bun SQL instance
 */
export default function db(url: string = POSTGRES_URL) {
  return new Bun.SQL({
    url,
    onconnect: () => {
      console.log("Connected to PostgreSQL");
    },
    onclose: () => {
      console.log("PostgreSQL connection closed");
    },
  });
}
