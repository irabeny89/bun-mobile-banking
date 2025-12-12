import { errorSchemaFactory } from "@/utils/response";
import Elysia from "elysia";
import { logger } from "./logger.plugin";
import pinoLogger from "@/utils/pino-logger";

export const errorHandler = new Elysia({ name: "error-handler" })
  .use(logger)
  .onError(({ code, error, store }) => {
    const logger = pinoLogger(store)
    const errorSchema = errorSchemaFactory();
    type ErrorResponse = typeof errorSchema.static;

    const errRes: ErrorResponse = {
      type: "error",
      error: {
        code,
        message: "Something went wrong",
        details: [],
      },
    }

    if (code === "VALIDATION") {
      errRes.error.message = "Invalid request data";
      let detail = error.detail(error.message) as Record<string, any>;
      detail = typeof detail === "string" ? JSON.parse(detail) : detail;
      logger.error(detail, "errorHandler:: error captured")
      errRes.error.details = detail.errors.map((error: any) => ({
        path: error.path,
        message: error.message,
      }))
    }
    else {
      logger.error(error, "errorHandler:: error captured")
    }
    logger.info("errorHandler:: error transformed to ErrorResponse")
    return errRes;
  }).as("global");
