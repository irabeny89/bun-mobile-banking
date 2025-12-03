import cors from "@elysiajs/cors";
// import { cron } from "@elysiajs/cron";
import jwt, { type JWTOption } from "@elysiajs/jwt";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { background } from "elysia-background";
import { healthcheckPlugin } from "elysia-healthcheck";
import { elysiaXSS } from "elysia-xss";
import logixlysia, { type Options } from "logixlysia";
import pkg from "../package.json";
import { IS_PROD_ENV, SECRET_1 } from "./config";
import { user } from "./user";
import { auth } from "./auth";

const logOption: Options = {
  config: {
    showStartupMessage: false,
    timestamp: {
      translateTime: "yyyy-mm-dd HH:MM:ss.SSS",
    },
    logFilePath: IS_PROD_ENV ? "./logs/app.log" : undefined,
    logRotation: {
      maxSize: "10m",
      interval: "1d",
      maxFiles: "7d",
      compress: true,
    },
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
const jwtOption: JWTOption<"jwt", undefined> = {
  name: "jwt",
  secret: SECRET_1,
};
const app = new Elysia()
  .use(logixlysia(logOption))
  .use(cors())
  .use(openapi({ references: fromTypes() }))
  .use(serverTiming())
  .use(healthcheckPlugin())
  .use(elysiaXSS({}))
  .use(jwt(jwtOption))
  .use(background())
  .get("/", () => "Hello Elysia")
  .group("/api", (app) => app.use(auth).use(user))
  .listen(3000);

console.log(`🦊 ${pkg.name} v${pkg.version} is running 🚀`);
console.log(`Server: ${app.server?.url}`);
console.log(`API Docs: ${app.server?.url}openapi`);
