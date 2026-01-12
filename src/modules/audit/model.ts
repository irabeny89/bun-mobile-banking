import { t } from "elysia";
import { CommonSchema } from "@/share/schema";

export namespace AuditModel {
    export const auditStatusSchema = t.UnionEnum(["success", "failure"]);
    export type AuditStatusT = typeof auditStatusSchema.static;

    export const auditActionSchema = t.UnionEnum([
        "login_attempt",
        "mfa_login_attempt",
        "register_attempt",
        "register_complete_attempt",
        "logout_attempt",
        "refresh_token_attempt",
        "statement_generation"
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
