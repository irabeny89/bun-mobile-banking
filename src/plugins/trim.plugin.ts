import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";

export const trim = new Elysia({ name: "trim" })
	.onBeforeHandle(({ body, headers, store }) => {
		if (body && typeof body === "object") {
			Object.entries(body).forEach(([key, value]) => {
				if (typeof value === "string") {
					const trimmed = value.trim();
					(body as Record<string, string>)[key] = trimmed;
					pinoLogger(store).debug({ field: key, value, trimmed }, "Property trimmed");
				}
			});
		}
	})
	.as("global");
