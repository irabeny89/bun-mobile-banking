import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import Elysia from "elysia";
import { KycModel } from "../model";
import { KycService } from "../service";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";

export const tier1Status = new Elysia({ name: "tier1-status" })
    .use(userMacro)
    .model({
        tier1StatusSuccess: KycModel.tier1SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .get("/tier1", async ({ user, logger, set }) => {
        if (!user) {
            logger.error("User not found")
            set.status = 401
            return {
                type: "error" as const,
                error: {
                    message: "Register or login to continue",
                    code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                    details: []
                }
            }
        }
        const tier1Status = await KycService.getTier1Status(user.id)
        if (!tier1Status) {
            logger.error("Tier 1 status not found")
            set.status = 404
            return {
                type: "error" as const,
                error: {
                    message: "Tier 1 status not found",
                    code: ERROR_RESPONSE_CODES.NOT_FOUND,
                    details: []
                }
            }
        }
        logger.info("Tier 1 status found")
        return {
            type: "success" as const,
            data: {
                tier1Status: tier1Status?.tier1Status,
                currentTier: tier1Status?.currentTier,
            }
        }
    }, {
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Get tier 1 status on your uploaded data",
            summary: "Get tier 1 status"
        },
        response: {
            200: "tier1StatusSuccess",
            401: "error",
            404: "error",
        }
    })