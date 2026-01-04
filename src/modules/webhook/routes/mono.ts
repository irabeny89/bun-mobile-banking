import { MONO } from "@/config";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { WebhookModel } from "../model";
import { WebhookService } from "../service";

export const monoWebhook = new Elysia({ name: "mono-webhook" })
    .model({
        accountConnectedBody: WebhookModel.MonoAccountConnectedBodySchema
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .post("/mono", async ({ body, logger }) => {
        if (body.event === "mono.events.account_connected") {
            logger.info("Mono account connected")
            await WebhookService.handleMonoAccountConnected(body.data)
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
        body: "accountConnectedBody"
    })