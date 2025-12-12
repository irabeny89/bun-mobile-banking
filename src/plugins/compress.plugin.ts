import { Elysia } from "elysia";
import pinoLogger from "@/utils/pino-logger";

export const compression = new Elysia()
	.mapResponse(({ responseValue, set, store }) => {
		const logger = pinoLogger(store)
		const isJson = typeof responseValue === "object";
		const text = isJson
		? JSON.stringify(responseValue)
		: (responseValue?.toString() ?? "empty");
		const compressed = Bun.gzipSync(Buffer.from(text));
		logger.debug({
			dataType: typeof responseValue,
			isJson,
			originalSize: text.length,
			compressedSize: compressed.length,
			responseValue,
		}, "compression:: response value");
		logger.info("compression:: returned compressed response");
		set.headers["Content-Encoding"] = "gzip";
		return new Response(compressed, {
			headers: {
				"Content-Type": `${isJson ? "application/json" : "text/plain"}; charset=utf-8`,
			},
		});
	}).as("global");
