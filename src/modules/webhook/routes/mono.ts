import { MONO } from "@/config";
import pinoLogger from "@/utils/pino-logger";
import Elysia, { t } from "elysia";
import { WebhookModel } from "../model";
import { WebhookService } from "../service";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

export const monoWebhook = new Elysia({ name: "mono-webhook" })
    .model({
        monoWebhookBody: t.Union([
            WebhookModel.monoAccountConnectedBodySchema,
            WebhookModel.monoAccountUpdatedBodySchema,
            WebhookModel.monoAccountUnlinkedBodySchema
        ])
    })
    .resolve(({ store, server, request, headers }) => {
        const logger = pinoLogger(store)
        return {
            logger,
            audit: {
                action: "webhook_received",
                userId: "mono",
                userType: "mono",
                targetId: "mono",
                targetType: "webhook",
                status: "success",
                details: {},
                ipAddress: server?.requestIP(request)?.address || "unknown",
                userAgent: headers["user-agent"] || "unknown",
            } as AuditModel.CreateAuditT
        }
    })
    .post("/mono", async ({ body, logger, set, audit }) => {
        const data = body.data as any
        audit.details = {
            event: body.event,
            accountId: data.id || data.account._id || data.account.id
        }
        const template = {
            "mono.events.account_connected": WebhookService.handleMonoAccountConnected,
            "mono.events.account_updated": WebhookService.handleMonoAccountUpdated,
            "mono.events.account_unlinked": WebhookService.handleMonoAccountUnlinked,
        }
        if (body.event in template) {
            try {
                await template[body.event](data)
                logger.info("Mono webhook processed successfully")
                await AuditService.log({
                    ...audit,
                    userId: body.event
                });
                return "ok"
            } catch (error: any) {
                logger.error(error, "Mono webhook failed")
                set.status = 500
                audit.details.reason = error.message
                await AuditService.log({
                    ...audit,
                    status: "failure"
                });
                return "error"
            }
        }
        else {
            logger.info(`Mono account unknown event ${body.event}`)
            await AuditService.log({
                ...audit,
                userId: "unknown",
                userType: "unknown",
                status: "failure",
                details: { body }
            });
            return "ok"
        }
    }, {
        async beforeHandle({ headers, body, set, logger, audit }) {
            logger.debug({ headers, body }, "Mono webhook received")
            if (headers["mono-webhook-secret"] !== MONO.webhookSecret) {
                logger.error("Mono webhook received with invalid secret")
                set.status = 401
                await AuditService.queue.add("log", {
                    ...audit,
                    status: "failure",
                    details: { reason: "Invalid webhook secret", event: body.event }
                });
                return "Unauthorized"
            }
        },
        body: "monoWebhookBody",
        detail: {
            tags: ["Webhook", "Mono"],
            description: "Mono webhook endpoint",
            summary: "Mono webhook"
        }
    })