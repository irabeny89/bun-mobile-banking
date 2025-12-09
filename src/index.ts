import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { healthcheckPlugin } from "elysia-healthcheck";
import { elysiaXSS } from "elysia-xss";
import pkg from "../package.json";
import { trim } from "./plugins/trim.plugin";
import { user } from "./modules/user";
import { errorHandler } from "./plugins/onerror.plugin";
import { compression } from "./plugins/compress.plugin";
import { logger } from "./plugins/logger.plugin";
import { auth } from "./modules/auth";
import { systemStatus } from "./plugins/system-status.plugin";

const app = new Elysia({
  name: pkg.name,
  detail: {
    description: pkg.description
  }
})
  .use(errorHandler)
  .use(systemStatus)
  .use(trim)
  .use(logger)
  .use(cors())
  .use(openapi())
  .use(serverTiming())
  .use(healthcheckPlugin())
  .use(elysiaXSS({}))
  .use(compression)
  .get("/", () => `Hello from ${pkg.name}.\n${pkg.description}`)
  .group("/api/v1", (app) => app.use(auth).use(user))
  .listen(3000);
