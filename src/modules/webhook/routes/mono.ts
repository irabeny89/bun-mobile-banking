import { MONO } from "@/config";
import pinoLogger from "@/utils/pino-logger";
import Elysia, { t } from "elysia";
import { WebhookModel } from "../model";
import { WebhookService } from "../service";

export const monoWebhook = new Elysia({ name: "mono-webhook" })
    .model({
        monoWebhookBody: t.Union([
            WebhookModel.monoAccountConnectedBodySchema,
            WebhookModel.monoAccountUpdatedBodySchema,
            WebhookModel.monoAccountUnlinkedBodySchema
        ])
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .post("/mono", async ({ body, logger, set }) => {
        const template = {
            "mono.events.account_connected": WebhookService.handleMonoAccountConnected,
            "mono.events.account_updated": WebhookService.handleMonoAccountUpdated,
            "mono.events.account_unlinked": WebhookService.handleMonoAccountUnlinked,
        }
        if (body.event in template) {
            try {
                await template[body.event](body.data as any)
                logger.info("Mono webhook processed successfully")
                return "ok"
            } catch(error) {
                logger.error(error, "Mono webhook failed")
                set.status = 500
                return "error"
            }
        }
        else {
            logger.info(`Mono account unknown event ${body.event}`)
            return "ok"
        }
    }, {
        beforeHandle({ headers, body, set, logger }) {
            logger.debug({ headers, body }, "Mono webhook received")
            if (headers["mono-webhook-secret"] !== MONO.webhookSecret) {
                logger.error("Mono webhook received with invalid secret")
                set.status = 401
                return "Unauthorized"
            }
        },
        body: "monoWebhookBody"
    })