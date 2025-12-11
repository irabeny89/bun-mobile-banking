import { errorSchemaFactory } from "@/utils/response";
import Elysia from "elysia";
import { logger } from "./logger.plugin";
import pinoLogger from "@/utils/pino-logger";

export const errorHandler = new Elysia({ name: "error-handler" })
  .use(logger)
  .onError(({ code, error, store }) => {
    const logger = pinoLogger(store)
    logger.error(error, "errorHandler:: error captured")
    const errorSchema = errorSchemaFactory();
    type ErrorResponse = typeof errorSchema.static;
    if (code === "VALIDATION") {
      const errRes: ErrorResponse = {
        status: "error",
        error: {
          code,
          message: "Invalid request data",
          details: error.all.map((e) => {
            const { message, path } = e as Record<string, string>;
            return {
              message,
              path,
            };
          }),
        },
      };
      logger.info("errorHandler:: validation error transformed to ErrorResponse")
      return errRes
    }
    else {
      const { message } = error as any;
      const errRes: ErrorResponse = {
        status: "error",
        error: {
          code: String(code),
          message,
        },
      };
      logger.info("errorHandler:: error transformed to ErrorResponse")
      return errRes
    }
  }).as("global");
