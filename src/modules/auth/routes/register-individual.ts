import { OTP_TTL } from "@/config";
import { IndividualUserService } from "@/modules/Individual_user/service";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { AuthService } from "../service";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";

export const registerIndividual = new Elysia({ name: "registerIndividual" })
    .model({
        register: AuthModel.registerBodySchema,
        registerSuccess: AuthModel.registerSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .post("/register/individual", async ({ body, logger }) => {
        logger.info("auth:: registering individual user")
        await AuthService.register(body, logger)
        return {
            type: "success",
            data: {
                nextStep: "verify email",
                message: `Check your email to complete your registration within ${OTP_TTL / 60} minutes.`
            }
        }
    }, {
        detail: {
            tags: ["Auth", "Individual User"],
            description: "Register individual user. First step of the registration process.",
            summary: "Registration individual start"
        },
        body: AuthModel.registerBodySchema,
        beforeHandle: async ({ body, set, logger }) => {
            const userExist = await IndividualUserService.existByEmail(body.email)
            if (userExist) {
                logger.info("auth:: user already exists")
                set.status = 400
                return {
                    type: "error" as const,
                    error: { 
                        message: "User already exists", 
                        code: ERROR_RESPONSE_CODES.USER_EXIST, 
                        details: [] 
                    }
                }
            }
            body.password = await Bun.password.hash(body.password)
            logger.debug("auth:: hashed plain password")
        },
        response: {
            200: "registerSuccess",
            400: "error",
        },
    })