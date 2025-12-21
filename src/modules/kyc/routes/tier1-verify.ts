import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { DojahNinLookupResponse, ERROR_RESPONSE_CODES } from "@/types";
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
            userId: user.id,
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
            const tier1Status = await KycService.getTier1Status(user.id)
            if (tier1Status) {
                logger.info("tier1Verify:: Tier 1 status already exist");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Tier 1 status already exist",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            const res = await KycService.dojahLookupNin({ nin: body.nin })
            if (!res.ok) {
                logger.error({ statusText: res.statusText }, "tier1Verify:: Tier 1 lookup failed");
                set.status = 500;
                return {
                    type: "error" as const,
                    error: {
                        message: "Tier 1 lookup failed",
                        code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                        details: []
                    }
                }
            }
            const data = await res.json() as DojahNinLookupResponse
            if (data.entity.first_name !== body.firstName || data.entity.last_name !== body.lastName || data.entity.middle_name !== body.middleName) {
                logger.error({ lookup: data, body }, "tier1Verify:: Tier 1 lookup failed, name mismatch");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Names on NIN do not match",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            logger.info("tier1Verify.beforeHandle:: Tier 1 lookup successful");
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
        }
    })