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
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";


export const tier1Verify = new Elysia({ name: "tier1-verify" })
    .use(userMacro)
    .model({
        tier1VerifyBody: KycModel.postTier1BodySchema,
        tier1VerifySuccess: KycModel.tier1SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store, server, request, headers }) => {
        return {
            logger: pinoLogger(store),
            audit: {
                action: "tier1_kyc_submission",
                userId: "unknown",
                userType: "individual",
                targetId: "unknown",
                targetType: "kyc",
                status: "success",
                details: {},
                ipAddress: server?.requestIP(request)?.address || "unknown",
                userAgent: headers["user-agent"] || "unknown",
            } as AuditModel.CreateAuditT
        }
    })
    .post("/tier1", async ({ user, body, logger, audit }) => {
        const { url, path } = getUploadLocation(
            STORAGE.passportPhotoPath,
            user!.userType,
            user!.id,
            body.passportPhoto.type.split("/")[1]
        )
        await fileStore
            .file(path)
            .write(encrypt(Buffer.from(await body.passportPhoto.arrayBuffer())))
        await kycQueue.add("tier_1_insert", {
            userId: user!.id,
            ...body,
            passportPhoto: url
        })
        logger.info("tier1Verify:: User KYC db data insertion queued")
        await AuditService.queue.add("log", {
            ...audit,
            userId: user!.id,
        });
        logger.info("tier1Verify:: audit log queued")
        return {
            type: "success" as const,
            data: {
                currentTier: "tier_1" as const,
                tier1Status: "pending" as const
            }
        }
    }, {
        async beforeHandle({ user, logger, set, body, audit }) {
            if (!user) {
                logger.info("tier1Verify.beforeHandle:: User not found");
                set.status = 401;
                await AuditService.queue.add("log", {
                    ...audit,
                    status: "failure",
                    details: { reason: "User not found" }
                });
                logger.info("tier1Verify.beforeHandle:: audit log queued")
                return {
                    type: "error" as const,
                    error: {
                        message: "Register or login to continue",
                        code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                        details: []
                    }
                }
            }
            audit.userId = user.id
            try {
                await KycService.verifyTier1Nin(user!.id, body)
            } catch (error: any) {
                if ((error.message as string).startsWith("Verification failed")) {
                    logger.error(error, "tier1Verify.beforeHandle:: Tier 1 NIN verification failed")
                    set.status = 400
                    await AuditService.queue.add("log", {
                        ...audit,
                        status: "failure",
                        details: { tier: 1, reason: error.message }
                    });
                    logger.info("tier1Verify.beforeHandle:: audit log queued")
                    return {
                        type: "error" as const,
                        error: {
                            message: error.message,
                            code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                            details: []
                        }
                    }
                }
                await AuditService.queue.add("log", {
                    ...audit,
                    status: "failure",
                    details: { tier: 1, reason: error.message }
                });
                logger.info("tier1Verify.beforeHandle:: audit log queued")
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
        parse: "formdata",
        body: "tier1VerifyBody",
        response: {
            200: "tier1VerifySuccess",
            400: "error",
            401: "error"
        },
    })