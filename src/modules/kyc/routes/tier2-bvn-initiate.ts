import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";
import { kycQueue } from "@/utils/kyc-queue";
import { KycService } from "../service";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";


export const tier2BvnInitiate = new Elysia({ name: "tier2-bvn-initiate" })
    .use(userMacro)
    .model({
        tier2InitiateBvnLookupBody: KycModel.tier2InitiateBvnLookupBodySchema,
        tier2BvnInitiateBvnLookupSuccess: KycModel.tier2InitiateBvnLookupSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .state("audit", {
        action: "identity_verification_init",
        userId: "unknown",
        userType: "individual",
        targetId: "unknown",
        targetType: "kyc",
        status: "success",
        details: { tier: 2 },
        ipAddress: "unknown",
        userAgent: "unknown",
    } as AuditModel.CreateAuditT)
    .resolve(({ store, server, request, headers }) => {
        store.audit.ipAddress = server?.requestIP(request)?.address || "unknown"
        store.audit.userAgent = headers["user-agent"] || "unknown"
        return { logger: pinoLogger(store) }
    })
    .post("/tier2/bvn/initiate", async ({ body, user, logger, set, store }) => {
        if (!user) {
            logger.info("tier2Verify:: User not found");
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
        await kycQueue.add("bvn_lookup", { userId: user.id, bvn: body.bvn })

        await AuditService.queue.add("log", {
            ...store.audit,
            userId: user.id,
            details: { tier: 2 }
        });
        logger.info("tier2Verify:: audit log queued")

        return {
            type: "success",
            data: {
                message: "Authorize BVN access with the OTP sent to your phone."
            }
        }
    }, {
        async beforeHandle({ body, set, logger, store }) {
            if (await KycService.bvnHashExists(body.bvn)) {
                logger.info("tier2Verify:: BVN already exists");
                set.status = 400;

                await AuditService.queue.add("log", {
                    ...store.audit,
                    status: "failure",
                    details: { tier: 2, reason: "BVN already exists" }
                });
                logger.info("tier2Verify.beforeHandle:: audit log queued")

                return {
                    type: "error" as const,
                    error: {
                        message: "BVN already exists",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
        },
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Initiate BVN verification",
            summary: "Initiate BVN verification",
        },
        user: ["individual"],
        body: "tier2InitiateBvnLookupBody",
        response: {
            200: "tier2BvnInitiateBvnLookupSuccess",
            400: "error",
            401: "error",
        }
    })