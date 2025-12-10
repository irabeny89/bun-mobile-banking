import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { logger } from "./logger.plugin";

export const trim = new Elysia({ name: "trim" })
	.use(logger)
	.onBeforeHandle(({ body, store }) => {
		const logger = pinoLogger(store)
		logger.trace("trim plugin")
		if (body && typeof body === "object") {
			Object.entries(body).forEach(([key, value]) => {
				if (typeof value === "string") {
					const trimmed = value.trim();
					(body as Record<string, string>)[key] = trimmed;
					logger.info({ field: key, value, trimmed, from: "trim plugin" }, "body property trimmed");
				}
			});
		}
	})
	.as("global");
