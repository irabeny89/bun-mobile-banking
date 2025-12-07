import cors from "@elysiajs/cors";
// import { cron } from "@elysiajs/cron";
import jwt, { type JWTOption } from "@elysiajs/jwt";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { background } from "elysia-background";
import { healthcheckPlugin } from "elysia-healthcheck";
import { elysiaXSS } from "elysia-xss";
import pkg from "../package.json";
import { IS_PROD_ENV, SECRET_1 } from "./config";
import { trim } from "./plugins/trim.plugin";
import { user } from "./modules/user";
import { errorHandler } from "./plugins/onerror.plugin";
import { compression } from "./plugins/compress.plugin";
import { logger } from "./plugins/logger.plugin";

const jwtOption: JWTOption<"jwt", undefined> = {
  name: "jwt",
  secret: SECRET_1,
};
const app = new Elysia({
	name: pkg.name,
	detail: {
		description: pkg.description
	}
})
  .use(errorHandler)
  .use(trim)
  .use(logger)
  .use(cors())
  .use(openapi())
  .use(serverTiming())
  .use(healthcheckPlugin())
  .use(elysiaXSS({}))
  .use(jwt(jwtOption))
  .use(background())
  .use(compression)
  .get("/", () => "Hello Elysia")
  .group("/api/v1", (app) => app.use(user))
  .listen(3000);

console.log(`🦊 ${pkg.name} v${pkg.version} server running 🚀`);
console.log(`🛠️  Environment: ${IS_PROD_ENV ? "production" : "development"}`);
console.log(`⚙️  Server: ${app.server?.url}`);
console.log(`📚 API Docs: ${app.server?.url}openapi`);
