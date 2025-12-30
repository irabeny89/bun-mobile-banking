import Elysia from "elysia";
import { userMacro } from "@/plugins/user-macro.plugin";
import { KycModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { ERROR_RESPONSE_CODES } from "@/types";
import { fileStore, getUploadLocation } from "@/utils/storage";
import { STORAGE } from "@/config";
import { encrypt } from "@/utils/encryption";

export const uploadPassportPhoto = new Elysia({ name: "upload-passport-photo" })
    .use(userMacro)
    .model({
        uploadPassportBody: KycModel.uploadPassportBodySchema,
        uploadPassportSuccess: KycModel.uploadPassportSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/upload/passport-photo", async ({ user, body }) => {
        const { url, path } = getUploadLocation(
            STORAGE.passportPhotoPath,
            user!.userType,
            user!.id,
            body.passportPhoto.type.split("/")[1]
        )
        await fileStore
            .file(path)
            .write(encrypt(Buffer.from(await body.passportPhoto.arrayBuffer())))
        return {
            type: "success" as const,
            data: {
                message: "Passport photo uploaded successfully",
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
            description: "Upload passport photo",
            summary: "Upload passport photo"
        },
        body: "uploadPassportBody",
        response: {
            200: "uploadPassportSuccess",
            400: "error",
        },
        parse: "multipart/form-data"
    })