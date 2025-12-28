import Elysia from "elysia";
import { IndividualUserModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { userMacro } from "@/plugins/user-macro.plugin";
import pinoLogger from "@/utils/pino-logger";
import { IndividualUserService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";

export const mfa = new Elysia({ name: "mfa-individual" })
    .model({
        mfa: IndividualUserModel.postMfaSchema,
        mfaSuccess: IndividualUserModel.postMfaSuccessSchema,
        error: CommonSchema.errorSchema
    })
    .use(userMacro)
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/mfa", async ({ logger, user, body, set }) => {
        if (!user) {
            set.status = 404
            return {
                type: "error",
                error: {
                    details: [],
                    message: "User not found",
                    code: ERROR_RESPONSE_CODES.NOT_FOUND
                }
            }
        }
        logger.info(`mfa:: ${body.mfaEnabled ? "enabling" : "disabling"} MFA`);
        await IndividualUserService.setMfa(user.id, body.mfaEnabled);
        return {
            type: "success",
            data: { mfaEnabled: body.mfaEnabled }
        }
    }, {
        detail: {
            tags: ["Individual User"],
            description: "Enable/disable MFA for the user",
            summary: "MFA toggle"
        },
        body: "mfa",
        response: {
            200: "mfaSuccess",
            400: "error",
            500: "error"
        },
        user: ["individual"]
    })
