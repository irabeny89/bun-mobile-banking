import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import Elysia from "elysia";
import { KycModel } from "../model";
import pinoLogger from "@/utils/pino-logger";
import { kycQueue } from "@/utils/kyc";
import { DojahLiveSelfieVerifyResponse, ERROR_RESPONSE_CODES } from "@/types";
import { KycService } from "../service";
import { imageUrlToBase64 } from "@/utils/url-to-base64";

export const tier3VerifyLiveSelfie = new Elysia({ name: "tier3-verify" })
    .use(userMacro)
    .model({
        tier3VerifyBody: KycModel.postTier3LiveSelfieBodySchema,
        tier3VerifySuccess: KycModel.tier3SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/tier3/live-selfie", async ({ user, body, logger }) => {
        await kycQueue.add("tier_3_update", {
            userId: user.id,
            ...body,
        })
        logger.info("tier3Verify:: User KYC db data insertion queued")
        return {
            type: "success" as const,
            data: {
                currentTier: "tier_3" as const,
                tier3Status: "pending" as const
            }
        }
    }, {
        async beforeHandle({ user, logger, set, body }) {
            const tier3Status = await KycService.getTier3Status(user.id)
            if (tier3Status && tier3Status.currentTier !== "tier_2") {
                logger.debug(tier3Status, "tier3VerifyAddressProof:: Only tier 2 users can verify tier 3");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Only tier 2 users can verify tier 3",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            const image = await imageUrlToBase64(body.liveSelfie)
            if (!image || typeof image !== "string") {
                logger.info("tier3VerifyAddressProof:: Verification failed - Invalid image");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Verification failed - Invalid image",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            const response = await KycService.dojahVerifySelfie({ image })
            if (!response.ok) {
                logger.info("tier3VerifyAddressProof:: Dojah liveness check failed");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Verification failed - Liveness check failed",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            const data = await response.json() as DojahLiveSelfieVerifyResponse
            if (!data.entity.liveness.liveness_check || data.entity.liveness.liveness_probability < 0.5) {
                logger.info("tier3VerifyAddressProof:: Dojah liveness check failed");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Verification failed - Liveness check failed",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
        },
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Verify tier 3 data using address proof",
            summary: "Verify tier 3 data using address proof"
        },
        body: "tier3VerifyBody",
        response: {
            200: "tier3VerifySuccess",
            400: "error",
        }
    })
