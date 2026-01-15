import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";
import { KycService } from "../service";
import { fileStore, getUploadLocation } from "@/utils/storage";
import { STORAGE } from "@/config";
import { encrypt } from "@/utils/encryption";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";


export const tier2Verify = new Elysia({ name: "tier2-verify" })
    .use(userMacro)
    .model({
        tier2VerifyBody: KycModel.postTier2BodySchema,
        tier2VerifySuccess: KycModel.tier2SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "tier2VerifyBody", user: ["individual"] }, app => app
        .state("audit", {
            action: "tier2_kyc_submission",
            userId: "unknown",
            userType: "individual",
            targetId: "unknown",
            targetType: "kyc",
            status: "success",
            details: {},
            ipAddress: "unknown",
            userAgent: "unknown",
        } as AuditModel.CreateAuditT)
        .resolve(async ({ store, server, request, headers }) => {
            store.audit.ipAddress = server?.requestIP(request)?.address || "unknown"
            store.audit.userAgent = headers["user-agent"] || "unknown"
            const logger = pinoLogger(store)
            return { logger }
        })
        .post("/tier2", async ({
            user,
            body: { bvnOtp, imageFile, ...rest },
            logger,
            set,
            store
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
                    KycService.queue.add("tier_2_update", {
                        userId: user!.id,
                        ...rest,
                        bvn: bvn!,
                        imageUrl: url
                    })
                ])
                await AuditService.queue.add("log", {
                    ...store.audit,
                });
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
                    await AuditService.queue.add("log", {
                        ...store.audit,
                        status: "failure",
                        details: { tier: 2, reason: error.message }
                    });
                    logger.info("tier2Verify:: audit log queued")
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
            async beforeHandle({ user, logger, set, body, store }) {
                const supportedIdTypes = ["driver's license", "international passport"]
                if (!supportedIdTypes.includes(body.idType)) {
                    logger!.info("tier2Verify:: ID type is not supported");
                    set.status = 400;
                    await AuditService.queue.add("log", {
                        ...store.audit,
                        userId: user?.id || "unknown",
                        status: "failure",
                        details: { tier: 2, reason: `ID type is not supported. Use ${supportedIdTypes.join(" or ")}` }
                    });
                    logger.info("tier2Verify:: audit log queued")
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
                    await AuditService.queue.add("log", {
                        ...store.audit,
                        status: "failure",
                        details: { tier: 2, reason: "User not found" }
                    });
                    logger.info("tier2Verify:: audit log queued")
                    return {
                        type: "error" as const,
                        error: {
                            message: "Register or login to continue",
                            code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                            details: []
                        }
                    }
                }
                store.audit.userId = user.id
                const tier2Status = await KycService.getTier2Status(user.id)
                if (tier2Status && tier2Status.currentTier !== "tier_1") {
                    logger!.debug(tier2Status, "tier2Verify:: Only tier 1 users can verify tier 2");
                    set.status = 400;
                    await AuditService.queue.add("log", {
                        ...store.audit,
                        status: "failure",
                        details: { tier: 2, reason: "Only tier 1 users can verify tier 2" }
                    });
                    logger.info("tier2Verify:: audit log queued")
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
                    await AuditService.queue.add("log", {
                        ...store.audit,
                        status: "failure",
                        details: { tier: 2, reason: error.message }
                    });
                    logger.info("tier2Verify:: audit log queued")
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
