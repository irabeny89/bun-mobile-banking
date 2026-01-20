import { t } from "elysia";
import { CommonSchema } from "@/share/schema";

export namespace AuditModel {
    export const auditStatusSchema = t.UnionEnum(["success", "failure"]);
    export type AuditStatusT = typeof auditStatusSchema.static;

    export const auditActionSchema = t.UnionEnum([
        "login",
        "mfa_login",
        "register",
        "register_complete",
        "logout",
        "refresh_token",
        "forgot_password",
        "reset-password",
        "toggle_mfa",
        "statement_generation",
        "tier1_kyc_submission",
        "tier2_kyc_submission",
        "tier3_kyc_submission",
        "tier2_kyc_bvn_initiate",
        "list_linked_accounts",
        "account_linking_init",
        "account_linking_complete",
        "account_linking_reconnect",
        "list_account_transactions",
        "webhook_received",
        "me"
    ]);
    export type AuditActionT = typeof auditActionSchema.static;

    export const auditTargetTypeSchema = t.UnionEnum([
        "auth",
        "account",
        "audit",
        "individual_user",
        "kyc",
        "webhook"
    ], {
        minLength: 1,
        description: "Target/module type e.g. account, auth, etc."
    })
    export type AuditTargetTypeT = typeof auditTargetTypeSchema.static

    export const createAuditSchema = t.Object({
        userId: t.Nullable(t.String()),
        userType: CommonSchema.userTypeSchema,
        action: auditActionSchema,
        targetType: auditTargetTypeSchema,
        targetId: t.Nullable(t.String({
            minLength: 1,
            description: "Target/resource id e.g. email, account id, user id, etc."
        })),
        details: t.Any({
            description: "Details in JSON object"
        }),
        ipAddress: t.String({
            description: "IP address"
        }),
        userAgent: t.String({
            description: "User agent"
        }),
        status: auditStatusSchema,
    });
    export type CreateAuditT = typeof createAuditSchema.static;

    export const auditSchema = t.Object({
        id: CommonSchema.idSchema,
        userId: t.Nullable(CommonSchema.idSchema),
        userType: CommonSchema.userTypeSchema,
        action: auditActionSchema,
        targetType: t.Optional(t.String()),
        targetId: t.Nullable(CommonSchema.idSchema),
        details: t.Any(),
        ipAddress: t.Nullable(t.String()),
        userAgent: t.Nullable(t.String()),
        status: auditStatusSchema,
        createdAt: t.Date(),
        updatedAt: t.Date(),
    });
    export type AuditT = typeof auditSchema.static;
}
