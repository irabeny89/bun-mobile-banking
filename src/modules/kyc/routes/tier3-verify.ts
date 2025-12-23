import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import Elysia from "elysia";
import { KycModel } from "../model";
import pinoLogger from "@/utils/pino-logger";
import { kycQueue } from "@/utils/kyc";
import { DojahUtilityBillVerifyResponse, ERROR_RESPONSE_CODES } from "@/types";
import { KycService } from "../service";

export const tier3VerifyAddressProof = new Elysia({ name: "tier3-verify" })
    .use(userMacro)
    .model({
        tier3VerifyBody: KycModel.postTier3AddressProofBodySchema,
        tier3VerifySuccess: KycModel.tier3SuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/tier3/address-proof", async ({ user, body, logger }) => {
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
            // currently Dojah supports utility bill verification
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
            const response = await KycService.dojahVerifyUtilityBill({
                input_type: "url",
                input_value: body.addressProof
            })
            if (!response.ok) {
                logger.info("tier3Verify:: Dojah utility bill verification failed");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Dojah utility bill verification failed",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            const data = await response.json() as DojahUtilityBillVerifyResponse
            if (data.entity.result.status !== "success") {
                logger.info("tier3Verify:: Dojah utility bill verification failed");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Dojah utility bill verification failed",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            if (!data.entity.metadata.is_recent) {
                logger.info("tier3Verify:: Dojah utility bill verification failed - Utility bill is not recent");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Verification failed - Utility bill is not recent",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            const tier1Data = await KycService.getTier1Data(user.id)
            if (!tier1Data) {
                logger.info("tier3Verify:: Tier 1 data not found");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Tier 1 data not found",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            if (tier1Data.street !== data.entity.address_info.street) {
                logger.info("tier3Verify:: Dojah utility bill verification failed - Street name mismatch");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Verification failed - Street name mismatch",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            if (tier1Data.city !== data.entity.address_info.city) {
                logger.info("tier3Verify:: Dojah utility bill verification failed - City name mismatch");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Verification failed - City name mismatch",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            if (tier1Data.state !== data.entity.address_info.state) {
                logger.info("tier3Verify:: Dojah utility bill verification failed - State name mismatch");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "Verification failed - State name mismatch",
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
