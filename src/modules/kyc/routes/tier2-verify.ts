import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";
import { KycService } from "../service";
import { kycQueue } from "@/utils/kyc-queue";
import { fileStore, getUploadLocation } from "@/utils/storage";
import { STORAGE } from "@/config";
import { encrypt } from "@/utils/encryption";

export const tier2Verify = new Elysia({ name: "tier2-verify" })
    .use(userMacro)
    .model({
        tier2VerifyBody: KycModel.postTier2BodySchema,
        tier2VerifySuccess: KycModel.tier2SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "tier2VerifyBody", user: ["individual"] }, app => app
        .resolve(async ({ store }) => {
            const logger = pinoLogger(store)
            return { logger }
        })
        .post("/tier2", async ({
            user,
            body: { bvnOtp, imageFile, ...rest },
            logger,
            set
        }) => {
            try {
                logger!.info("tier2Verify:: Verifying BVN")
                const { bvn } = await KycService.handleBvnVerify(user!.id, bvnOtp)
                logger!.info("tier2Verify:: BVN verified successfully")
                const { url, path } = getUploadLocation(
                    STORAGE.govtIdPath,
                    user!.userType,
                    user!.id,
                    imageFile.type.split("/")[1]
                )
                await Promise.all([
                    fileStore
                    .file(path)
                    .write(encrypt(Buffer.from(await imageFile.arrayBuffer()))),
                    kycQueue.add("tier_2_update", {
                        userId: user!.id,
                        ...rest,
                        bvn: bvn!,
                        imageUrl: url
                    })
                ])
                logger!.info("tier2Verify:: User KYC db data insertion queued")
                return {
                    type: "success" as const,
                    data: {
                        currentTier: "tier_2" as const,
                        tier2Status: "pending" as const
                    }
                }
            } catch (error: any) {
                if ((error.message as string).startsWith("Verification failed")) {
                    logger.error(error, "tier2Verify:: BVN verification failed")
                    set.status = 400
                    return {
                        type: "error",
                        error: {
                            message: error.message,
                            code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                            details: []
                        }
                    }
                }
                throw error
            }
        }, {
            async beforeHandle({ user, logger, set, body }) {
                const supportedIdTypes = ["driver's license", "international passport"]
                if (!supportedIdTypes.includes(body.idType)) {
                    logger!.info("tier2Verify:: ID type is not supported");
                    set.status = 400;
                    return {
                        type: "error" as const,
                        error: {
                            message: `ID type is not supported. Use ${supportedIdTypes.join(" or ")}`,
                            code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                            details: []
                        }
                    }
                }
                if (!user) {
                    logger!.info("tier2Verify:: User not found");
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
                const tier2Status = await KycService.getTier2Status(user.id)
                if (tier2Status && tier2Status.currentTier !== "tier_1") {
                    logger!.debug(tier2Status, "tier2Verify:: Only tier 1 users can verify tier 2");
                    set.status = 400;
                    return {
                        type: "error" as const,
                        error: {
                            message: "Only tier 1 users can verify tier 2",
                            code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                            details: []
                        }
                    }
                }
                try {
                    if (body.idType === "driver's license") await KycService
                        .handleDriverLicenseVerifyWithMono(user.id, body.govtId)
                    if (body.idType === "international passport") await KycService
                        .handlePassportVerifyWithMono(user.id, body.govtId)
                } catch (error: any) {
                    logger!.error(error, "tier2Verify.beforeHandle:: Tier 2 ID verification failed");
                    set.status = 400;
                    return {
                        type: "error" as const,
                        error: {
                            message: error.message,
                            code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                            details: []
                        }
                    }
                }
                logger!.info("tier2Verify.beforeHandle:: Tier 2 ID verification completed successfully");
            },
            user: ["individual"],
            detail: {
                tags: ["KYC", "Individual User"],
                description: "Verify tier 2 data",
                summary: "Verify tier 2 data"
            },
            parse: "formdata",
            body: "tier2VerifyBody",
            response: {
                200: "tier2VerifySuccess",
                400: "error",
                401: "error"
            }
        })
    )
