import { CommonSchema } from "@/share/schema";
import { TProperties } from "@/types";
import { t, TSchema } from "elysia";

export namespace WebhookModel {
    function monoWebhookBodyFactory<T extends TProperties & TSchema>(dataSchema: T) {
        return t.Object({
            event: t.UnionEnum([
                "mono.events.account_connected",
                "mono.events.account_connected.failed",
                "mono.events.account_updated"
            ], {
                description: "Event type",
            }),
            data: dataSchema
        })
    }

    export const monoAccountConnectedBodySchema = monoWebhookBodyFactory(t.Object({
        id: t.String({ description: "Account ID" }),
        customer: t.String({ description: "Customer ID" }),
        meta: CommonSchema.monoAccountConnectMetaSchema,
    }))
    export type MonoAccountConnectedBodyType = typeof monoAccountConnectedBodySchema.static

    export const monoAccountUpdatedBodySchema = monoWebhookBodyFactory(t.Object({
        account: t.Object({
            _id: t.String({ description: "Account ID" }),
            name: t.String({ description: "Account Name" }),
            accountNumber: t.String({ description: "Account Number" }),
            currency: t.String({ description: "Currency" }),
            balance: t.BigInt({ description: "Balance" }),
            type: t.String({ description: "Account Type" }),
            bvn: t.String({ description: "BVN" }),
            authMethod: t.String({ description: "Auth Method" }),
            institution: t.Object({
                name: t.String({ description: "Institution Name" }),
                bankCode: t.String({ description: "Bank Code" }),
                type: t.String({ description: "Institution Type" })
            }),
            created_at: t.String({ description: "Created At" }),
            updated_at: t.String({ description: "Updated At" })
        }),
        meta: t.Object({
            data_status: t.String({ description: "Data Status" }),
            auth_method: t.String({ description: "Auth Method" }),
            ref: t.String({ description: "Reference" }),
            retrieved_data: t.Array(t.String({ description: "Retrieved Data" }))
        })
    }))
    export type MonoAccountUpdatedBodyType = typeof monoAccountUpdatedBodySchema.static
}