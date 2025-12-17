import Elysia from "elysia";
import { IndividualUserModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { AuthService } from "@/modules/auth/service";
import { IndividualUserService } from "../service";

export const me = new Elysia({ name: "me-individual" })
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
    .get("/me", async ({ logger, headers, set }) => {
        const token = headers.authorization?.replace("Bearer ", "")
        if (!token) {
            logger.info("me:: token not found")
            set.status = 401
            return {
                type: "error",
                error: { message: "Unauthorized", code: "UNAUTHORIZED", details: [] }
            }
        }
        logger.info("me:: verify token")
        const payload = await AuthService.verifyToken(token, "access", "individual", logger)
        if (!payload) {
            logger.info("me:: token not valid")
            set.status = 401
            return {
                type: "error",
                error: { message: "Unauthorized", code: "UNAUTHORIZED", details: [] }
            }
        }
        logger.info("me:: finding individual user")
        const data = await IndividualUserService.getMe(payload.id)
        if (!data) {
            logger.info("me:: user not found")
            set.status = 404
            return {
                type: "error",
                error: { message: "User not found", code: "USER_NOT_FOUND", details: [] }
            }
        }
        logger.info("me:: return data")
        return { 
            type: "success", 
            data 
        }
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
    })