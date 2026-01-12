import { successSchemaFactory } from "@/utils/response";
import { t } from "elysia";
import { CommonSchema } from "@/share/schema";

export namespace AuditLogModel {
    export const auditLogStatusSchema = t.UnionEnum(["SUCCESS", "FAILURE"]);
    export type AuditLogStatusT = typeof auditLogStatusSchema.static;

    export const createAuditLogSchema = t.Object({
        userId: CommonSchema.idSchema,
        userType: CommonSchema.userTypeSchema,
        action: t.String({ minLength: 1 }),
        targetType: t.Optional(t.String()),
        targetId: t.Optional(t.String()),
        details: t.Optional(t.Any()),
        ipAddress: t.Optional(t.String()),
        userAgent: t.Optional(t.String()),
        status: t.Optional(auditLogStatusSchema),
    });
    export type CreateAuditLogT = typeof createAuditLogSchema.static;

    export const auditLogSchema = t.Object({
        id: CommonSchema.idSchema,
        userId: CommonSchema.idSchema,
        userType: CommonSchema.userTypeSchema,
        action: t.String(),
        targetType: t.Optional(t.String()),
        targetId: t.Optional(t.String()),
        details: t.Any(),
        ipAddress: t.Optional(t.String()),
        userAgent: t.Optional(t.String()),
        status: auditLogStatusSchema,
        createdAt: t.Date(),
    });
    export type AuditLogT = typeof auditLogSchema.static;
}
