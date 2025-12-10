import type { Logger } from "logixlysia";

export default function pinoLogger(store: object) {
    const { pino } = store as { pino: Logger["pino"] };
    return pino
}