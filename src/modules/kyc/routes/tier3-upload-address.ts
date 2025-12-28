import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { KycModel } from "../model";
import pinoLogger from "@/utils/pino-logger";
import { CommonSchema } from "@/share/schema";
import { KycService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";

export const tier3UploadAddressProof = new Elysia({ name: "tier3-upload-address" })
    .model({
        tier3UploadAddressProofBody: KycModel.postTier3AddressProofUploadBodySchema,
        tier3UploadAddressProofResponse: KycModel.postTier3AddressProofUploadResponseSchema,
        error: CommonSchema.errorSchema
    })
    .use(userMacro)
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/tier3/address-proof/upload", async ({ user, body, logger, set }) => {
        logger.debug(body.addressProofImage.type)
        if (!user) {
            set.status = 404
            return {
                type: "error" as const,
                error: {
                    details: [],
                    message: "User not found",
                    code: ERROR_RESPONSE_CODES.NOT_FOUND
                }
            }
        }
        logger.info("tier3UploadAddressProof:: uploading address proof")
        const url = await KycService
            .uploadAddressProof(body.addressProofImage, user.id, user.userType)
        logger.info("tier3UploadAddressProof:: file uploaded")
        return {
            type: "success",
            data: {
                message: "Address proof uploaded successfully",
                url
            }
        }
    }, {
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Upload address proof image file",
            summary: "Upload address proof"
        },
        body: "tier3UploadAddressProofBody",
        response: {
            200: "tier3UploadAddressProofResponse",
            400: "error"
        }
    })
