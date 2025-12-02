import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { healthcheckPlugin } from "elysia-healthcheck";
import pkg from "../package.json";

const app = new Elysia()
	.use(cors())
	.use(openapi())
	.use(serverTiming())
	.use(healthcheckPlugin())
	.get("/", () => "Hello Elysia")
	.listen(3000);

console.log(`🦊 ${pkg.name} is running 🚀`);
console.log(`Server: ${app.server?.url}`);
console.log(`API Docs: ${app.server?.url}openapi`);
