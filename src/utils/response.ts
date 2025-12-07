import { type TSchema, t } from "elysia";

type TPropertyKey = string | number;
type TProperties = Record<TPropertyKey, TSchema>;

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
        status: t.Literal("success"),
        data: t.Array(dataSchema),
        pagination: t.Object({
          cursor: t.String(),
          hasMore: t.Boolean(),
        }),
      })
    : t.Object({
        status: t.Literal("success"),
        data: dataSchema,
      });
}
/**
 * Factory function to generate HTTP error schema.
 * @returns Typebox schema for error
 */
export function errorSchemaFactory() {
  return t.Object({
    status: t.Literal("error"),
    error: t.Object({
      code: t.String(),
      message: t.String(),
      details: t.Optional(
        t.Array(
          t.Object({
            path: t.String(),
            message: t.String(),
          })
        )
      ),
    }),
  });
}
