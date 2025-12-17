import Elysia from "elysia";
import { IndividualUserModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { userMacro } from "@/plugins/user-macro.plugin";
import { ERROR_RESPONSE_CODES } from "@/types";

export const me = new Elysia({ name: "me-individual" })
    .use(userMacro)
    .model({
        me: IndividualUserModel.getMeSchema,
        meSuccess: IndividualUserModel.getMeSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .get("/me", async ({ logger, set, user }) => {
        if (!user) {
            logger.info("me:: user not found")
            set.status = 404
            return {
                type: "error",
                error: {
                    message: "User not found",
                    code: ERROR_RESPONSE_CODES.NOT_FOUND,
                    details: []
                }
            }
        }
        logger.info("me:: user found, returning data")
        return { type: "success", data: user }
    }, {
        detail: {
            tags: ["Individual User"],
            description: "Get authorized individual user data.",
            summary: "Get individual user"
        },
        response: {
            200: "meSuccess",
            401: "error",
            404: "error",
        },
        user: ["individual"]
    })