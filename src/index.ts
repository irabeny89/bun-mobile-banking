import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { healthcheckPlugin } from "elysia-healthcheck";
import { elysiaXSS } from "elysia-xss";
import logixlysia, { type Options } from "logixlysia";
import pkg from "../package.json";
import { IS_PROD_ENV } from "./config";

const logOption: Options = {
	config: {
		showStartupMessage: false,
		timestamp: {
			translateTime: "yyyy-mm-dd HH:MM:ss.SSS",
		},
		logFilePath: IS_PROD_ENV ? "./logs/app.log" : undefined,
		logFilter: IS_PROD_ENV
			? {
					level: ["ERROR", "WARNING", "INFO"],
					status: [500, 404],
					method: "GET",
				}
			: undefined,
		ip: true,
		customLogFormat:
			"🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip}",
	},
};
const app = new Elysia()
	.use(logixlysia(logOption))
	.use(cors())
	.use(openapi())
	.use(serverTiming())
	.use(healthcheckPlugin())
	.use(elysiaXSS({}))
	.get("/", () => "Hello Elysia")
	.listen(3000);

console.log(`🦊 ${pkg.name} v${pkg.version} is running 🚀`);
console.log(`Server: ${app.server?.url}`);
console.log(`API Docs: ${app.server?.url}openapi`);
