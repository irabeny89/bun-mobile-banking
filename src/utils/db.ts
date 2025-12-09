import { POSTGRES_URL } from "@/config";

let db: Bun.SQL | null = null;
/**
 * Initializes/Retrieves the Bun SQL database connection as a singleton.
 * @param url Connection string for the PostgreSQL database. Defaults to POSTGRES_URL from config.
 * @returns Bun SQL instance
 */
export default function dbSingleton(url: string = POSTGRES_URL) {
    if (!db) {
        db = new Bun.SQL({
            url,
            onconnect: () => {
                console.log("Connected to PostgreSQL");
            },
            onclose: () => {
                console.log("PostgreSQL connection closed");
            },
        });
    }
    return db;
}
