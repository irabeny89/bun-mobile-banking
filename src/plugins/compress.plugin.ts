import { Elysia } from "elysia";

const encoder = new TextEncoder();

export const compression = new Elysia().mapResponse(({ responseValue, set }) => {
	const isJson = typeof responseValue === "object";

	const text = isJson
		? JSON.stringify(responseValue)
		: (responseValue?.toString() ?? "");

	set.headers["Content-Encoding"] = "gzip";

	return new Response(Bun.gzipSync(encoder.encode(text)), {
		headers: {
			"Content-Type": `${
				isJson ? "application/json" : "text/plain"
			}; charset=utf-8`,
		},
	});
}).as("global");
