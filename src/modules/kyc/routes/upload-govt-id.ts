import Elysia from "elysia";
import { userMacro } from "@/plugins/user-macro.plugin";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";
import { fileStore, getUploadLocation } from "@/utils/storage";
import { STORAGE } from "@/config";
import { encrypt } from "@/utils/encryption";

export const uploadGovtId = new Elysia({ name: "upload-govt-id" })
    .use(userMacro)
    .model({
        uploadGovtIdBody: KycModel.uploadGovtIdBodySchema,
        uploadGovtIdSuccess: KycModel.uploadGovtIdSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/tier2/upload/govt-id", async ({ user, body }) => {
        const { url, path } = getUploadLocation(
            STORAGE.govtIdPath,
            user!.userType,
            user!.id,
            body.govtId.type.split("/")[1]
        )
        await fileStore
            .file(path)
            .write(encrypt(Buffer.from(await body.govtId.arrayBuffer())))
        return {
            type: "success" as const,
            data: {
                message: "Government ID uploaded successfully",
                url
            }
        }
    }, {
        beforeHandle({ user, logger, set }) {
            if (!user) {
                logger.info("uploadPassportPhoto.beforeHandle:: User not found");
                set.status = 400;
                return {
                    type: "error" as const,
                    error: {
                        message: "User not found",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
        },
        user: ["individual"],
        detail: {
            tags: ["KYC", "Individual User"],
            description: "Upload goverment ID photo e.g. international passport, driver's license, voter's ID card or national ID card",
            summary: "Upload goverment ID photo"
        },
        body: "uploadGovtIdBody",
        response: {
            200: "uploadGovtIdSuccess",
            400: "error",
        },
        parse: "multipart/form-data"
    })