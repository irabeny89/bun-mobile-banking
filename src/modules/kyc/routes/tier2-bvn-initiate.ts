import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";
import { kycQueue } from "@/utils/kyc-queue";
import { KycService } from "../service";

export const tier2BvnInitiate = new Elysia({ name: "tier2-bvn-initiate" })
    .use(userMacro)
    .model({
        tier2InitiateBvnLookupBody: KycModel.tier2InitiateBvnLookupBodySchema,
        tier2BvnInitiateBvnLookupSuccess: KycModel.tier2InitiateBvnLookupSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/tier2/bvn/initiate", async ({ body, user, logger, set }) => {
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
        await kycQueue.add("bvn_lookup", {userId: user.id, bvn: body.bvn})
        return {
            type: "success",
            data: {
                message: "Authorize BVN access with the OTP sent to your phone."
            }
        }
    }, {
        async beforeHandle({ body, set, logger }) {
            if (await KycService.bvnHashExists(body.bvn)) {
                logger.info("tier2Verify:: BVN already exists");
                set.status = 400;
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