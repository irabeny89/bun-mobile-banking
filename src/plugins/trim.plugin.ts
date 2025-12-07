import Elysia from "elysia";
import type { Logger } from "logixlysia";

export const trim = new Elysia({ name: "trim" })
	.onBeforeHandle(({ body, headers, store }) => {
		const { pino } = store as { pino: Logger["pino"] };
		pino.debug(headers, "request header");
		const methods = ["GET", "HEAD"];
		const reqMethod = headers["method"] as string;
		const bodyRef = body as Record<string, string>;
		if (!methods.includes(reqMethod)) {
			Object.entries(bodyRef).forEach(([key, value]) => {
				if (typeof value === "string") {
					bodyRef[key] = value.trim();
				}
			});
		}
	})
	.as("global");
