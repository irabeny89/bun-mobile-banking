import cors from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia, file } from "elysia";
import pkg from "../package.json";
import { errorHandler } from "./plugins/onerror.plugin";
import { auth } from "./modules/auth";
import { systemStatus } from "./plugins/system-status.plugin";
import { individualUser } from "./modules/Individual_user";
import { healthcheck } from "./plugins/healthcheck.plugin";
import { cacheReq } from "./plugins/cache-req";
import { logger } from "./plugins/logger.plugin";
import { rateLimitPlugin } from "./plugins/rate-limit.plugin";
import { apiDocs } from "./plugins/api-docs.plugin";
import { kyc } from "./modules/kyc";
import { PORT } from "./config";
import { webhook } from "./modules/webhook";
import { account } from "./modules/account";

export const app = new Elysia({
  name: pkg.name,
  detail: {
    description: pkg.description
  },
  aot: false
})
  .use(errorHandler)
  .use(systemStatus)
  .use(cors())
  .use(apiDocs)
  .use(serverTiming())
  .use(logger)
  .use(cacheReq)
  .use(rateLimitPlugin)
  .use(healthcheck)
  .get("/", () => `Hello from ${pkg.name}.\n${pkg.description}`)
  .get("/favicon.ico", () => file("public/favicon.ico"))
  .get("/site.webmanifest", () => file("public/site.webmanifest"))
  .get("/apple-touch-icon.png", () => file("public/apple-touch-icon.png"))
  .get("/android-chrome-192x192.png", () => file("public/android-chrome-192x192.png"))
  .get("/android-chrome-512x512.png", () => file("public/android-chrome-512x512.png"))
  .group("/api/v1", (app) => app
    .use(auth)
    .use(individualUser)
    .use(kyc)
    .use(account)
    .use(webhook)
  )
  .listen(PORT);
