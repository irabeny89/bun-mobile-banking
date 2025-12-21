import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { DojahVinLookupResponse, ERROR_RESPONSE_CODES } from "@/types";
import { KycService } from "../service";
import { kycQueue } from "@/utils/kyc";

export const tier2Verify = new Elysia({ name: "tier2-verify" })
    .use(userMacro)
    .model({
        tier2VerifyBody: KycModel.postTier2BodySchema,
        tier2VerifySuccess: KycModel.tier2SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/tier2", async ({ user, body, logger }) => {
        await kycQueue.add("tier_2_update", {
            userId: user.id,
            ...body
        })
        logger.info("tier2Verify:: User KYC db data insertion queued")
        return {
            type: "success" as const,
            data: {
                currentTier: "tier_2" as const,
                tier2Status: "pending" as const
            }
        }
    }, {
        async beforeHandle({ user, logger, set, body }) {
            // current Dojah supports Voter Identification Number (VIN) lookup
            if (body.idType !== "voter's ID card") {
                logger.info("tier2Verify:: ID type is not supported");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "ID type is not supported. Use voter's ID card number - VIN",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            const tier2Status = await KycService.getTier2Status(user.id)
            if (tier2Status && tier2Status.currentTier !== "tier_1") {
                logger.debug(tier2Status, "tier2Verify:: Only tier 1 users can verify tier 2");
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
            const res = await KycService.dojahLookupVin({ vin: body.govtId })
            if (!res.ok) {
                logger.error({ statusText: res.statusText }, "tier2Verify:: Tier 2 VIN lookup failed");
                set.status = 500;
                return {
                    type: "error" as const,
                    error: {
                        message: "Tier 2 VIN lookup failed",
                        code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                        details: []
                    }
                }
            }
            const data = await res.json() as DojahVinLookupResponse
            if (data.entity.voter_identification_number !== body.govtId) {
                logger.error({ lookup: data, body }, "tier2Verify:: Tier 2 lookup failed, VIN mismatch");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "VIN do not match",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            logger.info("tier2Verify.beforeHandle:: Tier 2 lookup successful");
        },
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Verify tier 2 data",
            summary: "Verify tier 2 data"
        },
        body: "tier2VerifyBody",
        response: {
            200: "tier2VerifySuccess",
            400: "error",
        }
    })