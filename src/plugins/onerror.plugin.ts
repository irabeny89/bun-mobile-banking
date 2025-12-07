import { errorSchemaFactory } from "@/utils/response";
import Elysia from "elysia";

export const errorHandler = new Elysia({ name: "error-handler" })
  .onError(({ code, error }) => {
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
  })
  .as("global");
