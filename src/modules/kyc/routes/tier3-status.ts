import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import Elysia from "elysia";
import { KycModel } from "../model";
import { KycService } from "../service";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";

export const tier3Status = new Elysia({ name: "tier3-status" })
    .use(userMacro)
    .model({
        tier3StatusSuccess: KycModel.tier3SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return { logger }
    })
    .get("/tier3", async ({ user, logger, set }) => {
        if (!user) {
            logger.error("User not found")
            set.status = 404
            return {
                type: "error" as const,
                error: {
                    message: "User not found",
                    code: ERROR_RESPONSE_CODES.NOT_FOUND,
                    details: []
                }
            }
        }
        const tier3Status = await KycService.getTier3Status(user.id)
        if (!tier3Status) {
            logger.error("Tier 3 status not found")
            set.status = 404
            return {
                type: "error" as const,
                error: {
                    message: "Tier 3 status not found",
                    code: ERROR_RESPONSE_CODES.NOT_FOUND,
                    details: []
                }
            }
        }
        logger.info("Tier 3 status found")
        return {
            type: "success" as const,
            data: {
                tier3Status: tier3Status?.tier3Status,
                currentTier: tier3Status?.currentTier,
            }
        }
    }, {
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Get tier 3 status on your uploaded data",
            summary: "Get tier 3 status"
        },
        response: {
            200: "tier3StatusSuccess",
            404: "error",
        }
    })