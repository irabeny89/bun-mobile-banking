import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";
import { KycService } from "../service";
import { kycQueue } from "@/utils/kyc";

export const tier1Verify = new Elysia({ name: "tier1-verify" })
    .use(userMacro)
    .model({
        tier1VerifyBody: KycModel.postTier1BodySchema,
        tier1VerifySuccess: KycModel.tier1SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/tier1", async ({ user, body, logger }) => {
        await kycQueue.add("tier_1_insert", {
            userId: user!.id,
            ...body
        })
        logger.info("tier1Verify:: User KYC db data insertion queued")
        return {
            type: "success" as const,
            data: {
                currentTier: "tier_1" as const,
                tier1Status: "pending" as const
            }
        }
    }, {
        async beforeHandle({ user, logger, set, body }) {
            if (!user) {
                logger.info("tier1Verify.beforeHandle:: User not found");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "User not found",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            try {
                await KycService.verifyTier1Nin(user!.id, body)
            } catch (error: any) {
                if ((error.message as string).startsWith("Verification failed")) {
                    logger.error(error, "tier1Verify.beforeHandle:: Tier 1 NIN verification failed")
                    set.status = 400
                    return {
                        type: "error" as const,
                        error: {
                            message: error.message,
                            code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                            details: []
                        }
                    }
                }
                throw error
            }
            logger.info("tier1Verify.beforeHandle:: Tier 1 NIN verification successful");
        },
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Verify tier 1 data",
            summary: "Verify tier 1 data"
        },
        body: "tier1VerifyBody",
        response: {
            200: "tier1VerifySuccess",
            400: "error",
        },
    })