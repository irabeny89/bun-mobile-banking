import { Elysia } from "elysia";
import pinoLogger from "@/utils/pino-logger";

const encoder = new TextEncoder();

export const compression = new Elysia()
	.mapResponse({ as: "scoped" }, ({ responseValue, set, store }) => {
		const logger = pinoLogger(store)

		const isJson = typeof responseValue === "object";

		logger.debug({
			dataType: typeof responseValue,
			isJson,
			responseValue,
		}, "compression:: response value");

		const text = isJson
			? JSON.stringify(responseValue)
			: (responseValue?.toString() ?? "empty");

		const compressed = Bun.gzipSync(encoder.encode(text));
		logger.info("compression:: returned compressed response");
		set.headers["Content-Encoding"] = "gzip";
		return new Response(compressed, {
			headers: {
				"Content-Type": `${isJson ? "application/json" : "text/plain"}; charset=utf-8`,
			},
		});
	}).as("global");
