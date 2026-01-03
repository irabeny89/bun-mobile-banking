import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import Elysia from "elysia";
import { KycModel } from "../model";
import pinoLogger from "@/utils/pino-logger";
import { kycQueue } from "@/utils/kyc-queue";
import { ERROR_RESPONSE_CODES } from "@/types";
import { KycService } from "../service";
import { STORAGE } from "@/config";
import { getUploadLocation } from "@/utils/storage";

export const tier3Verify = new Elysia({ name: "tier3-verify" })
    .use(userMacro)
    .model({
        tier3VerifyBody: KycModel.postTier3BodySchema,
        tier3VerifySuccess: KycModel.tier3SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/tier3/verify", async ({ user, body, logger }) => {
        const { path } = getUploadLocation(
            STORAGE.utilityBillPath,
            user!.userType,
            user!.id,
            body.addressProof.type.split("/").pop() as string
        )
        await kycQueue.add("tier_3_update", {
            userId: user!.id,
            storagePath: path,
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
            // currently supports utility bill verification
            if (body.proofType !== "utility bill") {
                logger.info("tier3Verify:: Proof type is not supported");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Proof type is not supported. Use utility bill",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            if (!user) {
                logger.info("tier3Verify:: User not found");
                set.status = 401;
                return {
                    type: "error" as const,
                    error: {
                        message: "Register or login to continue",
                        code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                        details: []
                    }
                }
            }
            const tier3Status = await KycService.getTier3Status(user.id)
            if (tier3Status && tier3Status.currentTier !== "tier_2") {
                logger.debug(tier3Status, "tier3Verify:: Only tier 2 users can verify tier 3");
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
            try {
                await Promise.all([
                    KycService.livenessCheckWithDojah(body.liveSelfie),
                    KycService.verifyUtilityBillWithDojah(body.addressProof, user.id, user.userType)
                ])
            } catch (err: any) {
                logger.error(err, "tier3Verify:: verification failed");
                if ((err.message as string).startsWith("Verification failed")) {
                    set.status = 400;
                    return {
                        type: "error" as const,
                        error: {
                            message: err.message,
                            code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                            details: []
                        }
                    }
                }
                throw err
            }
        },
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Verify tier 3 data using address proof",
            summary: "Verify tier 3 data using address proof"
        },
        parse: "formdata",
        body: "tier3VerifyBody",
        response: {
            200: "tier3VerifySuccess",
            400: "error",
            401: "error"
        }
    })
