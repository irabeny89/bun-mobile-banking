import Elysia from "elysia";
import { IndividualUserModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { userMacro } from "@/plugins/user-macro.plugin";
import pinoLogger from "@/utils/pino-logger";
import { IndividualUserService } from "../service";

export const mfa = new Elysia({ name: "mfa-individual" })
    .use(userMacro)
    .model({
        mfa: IndividualUserModel.postMfaSchema,
        mfaSuccess: IndividualUserModel.postMfaSuccessSchema,
        error: CommonSchema.errorSchema
    })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .post("/mfa", async ({ logger, user }) => {
        logger.info(`mfa:: ${user.mfaEnabled ? "enabling" : "disabling"} MFA`);
        await IndividualUserService.setMfa(user.id, !user.mfaEnabled);
        return {
            type: "success",
            data: { mfaEnabled: user.mfaEnabled }
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
