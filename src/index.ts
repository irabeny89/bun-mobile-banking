import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { elysiaXSS } from "elysia-xss";
import pkg from "../package.json";
import { trim } from "./plugins/trim.plugin";
import { errorHandler } from "./plugins/onerror.plugin";
import { compression } from "./plugins/compress.plugin";
import { logger } from "./plugins/logger.plugin";
import { auth } from "./modules/auth";
import { systemStatus } from "./plugins/system-status.plugin";
import { individualUser } from "./modules/Individual_user";
import { healthcheck } from "./plugins/heathcheck.plugin";

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
  .use(elysiaXSS({}))
  .use(compression)
  .use(healthcheck)
  .get("/", () => `Hello from ${pkg.name}.\n${pkg.description}`)
  .group("/api/v1", (app) => app.use(auth).use(individualUser))
  .listen(3000);
