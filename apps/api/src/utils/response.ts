import { CommonSchema } from "@/share/schema";
import { TProperties } from "@/types";
import { type TSchema, t } from "elysia";

/**
 * HTTP success response schema factory for creating schema for data or with pagination.
 * @param type Single data or paging data
 * @param dataSchema Typebox schema for the data
 * @returns Typebox schema
 */
export function successSchemaFactory<T extends TProperties & TSchema>(
  dataSchema: T,
  type: "single data" | "paging data" = "single data"
) {
  return type === "paging data"
    ? t.Object({
      type: t.Literal("success"),
      data: t.Array(dataSchema),
      pagination: CommonSchema.pagingResponseSchema,
    })
    : t.Object({
      type: t.Literal("success"),
      data: dataSchema,
    });
}
/**
 * Factory function to generate HTTP error schema.
 * @returns Typebox schema for error
 */
export function errorSchemaFactory() {
  return t.Object({
    type: t.Literal("error"),
    error: t.Object({
      code: t.Union([t.String(), t.Number()]),
      message: t.String(),
      details: t.Array(
        t.Object({
          path: t.String(),
          message: t.String(),
          value: t.String(),
        })
      )
    }),
  });
}
