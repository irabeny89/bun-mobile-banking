import { t } from "elysia";
import { successSchemaFactory } from "@/utils/response";

export namespace AccountModel {
    export const connectSuccessSchema = successSchemaFactory(t.Object({
        message: t.Literal("Click the link to connect your account"),
        connectUrl: t.String()
    }))
    export type ConnectSuccessT = typeof connectSuccessSchema.static
}