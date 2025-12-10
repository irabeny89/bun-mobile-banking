import { errorSchemaFactory } from "@/utils/response";
import Elysia from "elysia";
import { logger } from "./logger.plugin";
import pinoLogger from "@/utils/pino-logger";

export const errorHandler = new Elysia({ name: "error-handler" })
  .use(logger)
  .onError(({ code, error, store }) => {
    const logger = pinoLogger(store)
    logger.trace("error handler")
    logger.error(error, "error")
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
      return errRes;
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
      return errRes;
    }
  });
