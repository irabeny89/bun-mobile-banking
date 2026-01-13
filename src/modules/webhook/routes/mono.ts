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
    .state("audit", {
        action: "webhook_received",
        userId: "mono",
        userType: "mono",
        targetId: "mono",
        targetType: "webhook",
        status: "success",
        details: {},
        ipAddress: "unknown",
        userAgent: "unknown",
    } as AuditModel.CreateAuditT)
    .resolve(({ store, server, request, headers }) => {
        store.audit.ipAddress = server?.requestIP(request)?.address || "unknown"
        store.audit.userAgent = headers["user-agent"] || "unknown"
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .post("/mono", async ({ body, logger, set, store }) => {
        const data = body.data as any
        store.audit.details = {
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
                    ...store.audit,
                    userId: body.event
                });
                return "ok"
            } catch (error: any) {
                logger.error(error, "Mono webhook failed")
                set.status = 500
                store.audit.details.reason = error.message
                await AuditService.log({
                    ...store.audit,
                    status: "failure"
                });
                return "error"
            }
        }
        else {
            logger.info(`Mono account unknown event ${body.event}`)
            await AuditService.log({
                ...store.audit,
                userId: "unknown",
                userType: "unknown",
                status: "failure",
                details: { body }
            });
            return "ok"
        }
    }, {
        async beforeHandle({ headers, body, set, logger, store }) {
            logger.debug({ headers, body }, "Mono webhook received")
            if (headers["mono-webhook-secret"] !== MONO.webhookSecret) {
                logger.error("Mono webhook received with invalid secret")
                set.status = 401
                await AuditService.queue.add("log", {
                    ...store.audit,
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