import dbSingleton from "@/utils/db";
import { AuditLogModel } from "./model";

const db = dbSingleton();

export class AuditLogService {
    static async log(data: AuditLogModel.CreateAuditLogT) {
        try {
            await db`
                INSERT INTO audit_logs (
                    user_id,
                    user_type,
                    action,
                    target_type,
                    target_id,
                    details,
                    ip_address,
                    user_agent,
                    status
                ) VALUES (
                    ${data.userId},
                    ${data.userType},
                    ${data.action},
                    ${data.targetType ?? null},
                    ${data.targetId ?? null},
                    ${data.details ?? {}},
                    ${data.ipAddress ?? null},
                    ${data.userAgent ?? null},
                    ${data.status ?? 'SUCCESS'}
                )
            `;
        } catch (error) {
            console.error("AuditLogService::log failed", error);
            // We usually don't want to crash the request if logging fails, but it depends on the strictness.
            // For now, we just log the error.
        }
    }

    static async findAll(userId: string) {
        return db<AuditLogModel.AuditLogT[]>`
            SELECT * FROM audit_logs
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;
    }
}
