import { IS_PROD_ENV } from "@/config";
import Elysia from "elysia";
import logixlysia from "logixlysia";

export const logger = new Elysia({ name: "logger" })
  .use(
    logixlysia({
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
        pino: {
          level: "debug",
          prettyPrint: true,
          redact: ["password", "token"],
        },
        ip: true,
        customLogFormat:
          "🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip}",
      },
    })
  ).as("global")
