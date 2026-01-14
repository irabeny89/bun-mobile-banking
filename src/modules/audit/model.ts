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
        "account_linking_init",
        "account_linking_complete",
        "account_linking_reconnect",
        "webhook_received",
        "me"
    ]);
    export type AuditActionT = typeof auditActionSchema.static;

    export const createAuditSchema = t.Object({
        userId: t.String(),
        userType: CommonSchema.userTypeSchema,
        action: auditActionSchema,
        targetType: t.Optional(t.UnionEnum([
            "auth",
            "account",
            "audit",
            "individual_user",
            "kyc",
            "webhook"
        ], {
            minLength: 1,
            description: "Target/module type e.g. account, auth, etc."
        })),
        targetId: t.Optional(t.String({
            minLength: 1,
            description: "Target/resource id e.g. email, account id, user id, etc."
        })),
        details: t.Optional(t.Any({
            description: "Details in JSON object"
        })),
        ipAddress: t.Optional(t.String({
            description: "IP address"
        })),
        userAgent: t.Optional(t.String({
            description: "User agent"
        })),
        status: t.Optional(auditStatusSchema),
    });
    export type CreateAuditT = typeof createAuditSchema.static;

    export const auditSchema = t.Object({
        id: CommonSchema.idSchema,
        userId: CommonSchema.idSchema,
        userType: CommonSchema.userTypeSchema,
        action: auditActionSchema,
        targetType: t.Optional(t.String()),
        targetId: t.Optional(t.String()),
        details: t.Any(),
        ipAddress: t.Optional(t.String()),
        userAgent: t.Optional(t.String()),
        status: auditStatusSchema,
        createdAt: t.Date(),
        updatedAt: t.Date(),
    });
    export type AuditT = typeof auditSchema.static;
}
