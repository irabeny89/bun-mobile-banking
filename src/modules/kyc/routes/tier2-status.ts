import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import Elysia from "elysia";
import { KycModel } from "../model";
import { KycService } from "../service";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";

export const tier2Status = new Elysia({ name: "tier2-status" })
    .use(userMacro)
    .model({
        tier2StatusSuccess: KycModel.tier2SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .get("/tier2", async ({ user, logger, set }) => {
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
        const tier2Status = await KycService.getTier2Status(user.id)
        if (!tier2Status) {
            logger.error("Tier 2 status not found")
            set.status = 404
            return {
                type: "error" as const,
                error: {
                    message: "Tier 2 status not found",
                    code: ERROR_RESPONSE_CODES.NOT_FOUND,
                    details: []
                }
            }
        }
        logger.info("Tier 2 status found")
        return {
            type: "success" as const,
            data: {
                tier2Status: tier2Status?.tier2Status,
                currentTier: tier2Status?.currentTier,
            }
        }
    }, {
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Get tier 2 status on your uploaded data",
            summary: "Get tier 2 status"
        },
        response: {
            200: "tier2StatusSuccess",
            404: "error",
        }
    })