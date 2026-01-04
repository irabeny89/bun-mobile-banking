import { CommonSchema } from "@/share/schema";
import { TProperties } from "@/types";
import { t, TSchema } from "elysia";

export namespace WebhookModel {
    function monoWebhookBodyFactory<T extends TProperties & TSchema>(dataSchema: T) {
        return t.Object({
            event: t.UnionEnum(["mono.events.account_connected"], {
                description: "Event type",
            }),
            data: dataSchema
        })
    }

    export const MonoAccountConnectedBodySchema = monoWebhookBodyFactory(t.Object({
        id: t.String({ description: "Account ID" }),
        customer: t.String({ description: "Customer ID" }),
        meta: CommonSchema.monoAccountConnectMetaSchema,
    }))
    export type MonoAccountConnectedBodyType = typeof MonoAccountConnectedBodySchema.static
}