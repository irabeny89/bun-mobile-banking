import type { Logger } from "logixlysia";

/**
 * Pino logger utility function to extract the untyped pino logger from the Elysia store object.
 * @param store Elysia store object
 * @returns pino logger
 */
export default function pinoLogger(store: object) {
    const { pino } = store as { pino: Logger["pino"] };
    return pino
}