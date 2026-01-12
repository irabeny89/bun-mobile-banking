import dbSingleton from "@/utils/db";
import { AuditModel } from "./model";
import { Queue, Worker } from "bullmq";
import { VALKEY_URL } from "@/config";

type JobName = "log"
type JobData = AuditModel.CreateAuditT

const queueName = "audit-queue" as const
const db = dbSingleton();
const worker = new Worker<JobData, unknown, JobName>(queueName, async (job) => {
    console.info("auditQueue.worker:: job started")
    if (job.name === "log") {
        console.info("auditQueue.worker:: logging audit")
        await AuditService.log(job.data)
    }
}, { connection: { url: VALKEY_URL } })

worker.on("completed", () => {
    console.info("auditQueue.worker:: job completed")
})

worker.on("failed", (_, error) => {
    console.error(error, "auditQueue.worker:: job failed")
})

export class AuditService {
    static queue = new Queue<JobData, unknown, JobName>(queueName)
    static async log(data: AuditModel.CreateAuditT) {
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
    }

    static async findByUserId(userId: string) {
        return db<AuditModel.AuditT[]>`
            SELECT
                id,
                user_id as userId,
                user_type as userType,
                action,
                target_type as targetType,
                target_id as targetId,
                details,
                ip_address as ipAddress,
                user_agent as userAgent,
                status,
                created_at as createdAt,
                updated_at as updatedAt
            FROM audit_logs
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;
    }
}
