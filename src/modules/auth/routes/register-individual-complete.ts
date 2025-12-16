import { IndividualUserService } from "@/modules/Individual_user/service";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthService } from "../service";
import { AuthModel } from "../model";

export const registerIndividualComplete = new Elysia({
    name: "registerIndividualComplete"
})
    .model({
        registerComplete: AuthModel.registerCompleteSchema,
        registerCompleteSuccess: AuthModel.registerCompleteSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "registerComplete" }, app => app
        .resolve(async ({ body, store, set }) => {
            const logger = pinoLogger(store)
            const registerData = await AuthService.getUserRegisterData(body.otp)
            if (!registerData) {
                logger.info("registerIndividualComplete:: invalid otp, no register data")
                set.status = 400
                return {
                    type: "error",
                    error: { message: "Invalid OTP", code: "INVALID_OTP", details: [] }
                }
            }
            logger.info("registerIndividualComplete:: otp verified successfully")
            return { registerData, logger }
        })
        .post("/register/individual/complete", async ({ logger, registerData }) => {
            logger?.info("registerIndividualComplete:: creating individual user")
            const res = await IndividualUserService.create(registerData!)
            logger?.info("registerIndividualComplete:: individual user created successfully")
            const tokenPayload: CommonSchema.TokenPayloadT = {
                id: res.id,
                userType: res.userType,
                email: res.email,
            }
            logger?.info("registerIndividualComplete:: generating access and refresh tokens")
            const { accessToken, refreshToken } = AuthService.createTokens(tokenPayload)
            logger?.info("registerIndividualComplete:: caching refresh token")
            await AuthService.cacheRefreshToken(refreshToken, tokenPayload.id)
            return {
                type: "success",
                data: { accessToken, refreshToken, message: "OTP verified successfully", }
            }
        }, {
            detail: {
                tags: ["Auth", "Individual User"],
                description: "Register individual user. Second and final step of the registration process."
            },
            body: "registerComplete",
            beforeHandle: async ({ registerData, set, logger }) => {
                if (!registerData) {
                    logger?.info("registerIndividualComplete:: no register data")
                    set.status = 400
                    return {
                        type: "error" as const,
                        error: {
                            message: "No register data. Please try and register again.",
                            code: "NO_REGISTER_DATA",
                            details: []
                        }
                    }
                }
                const userExist = await IndividualUserService.existByEmail(registerData.email)
                if (userExist) {
                    logger?.info("registerIndividualUser:: user already exists")
                    set.status = 400
                    return {
                        type: "error" as const,
                        error: { message: "User already exists", code: "USER_EXIST", details: [] }
                    }
                }
                logger?.debug(registerData, "registerIndividualUser:: register data verified successfully")
            },
            response: {
                200: "registerCompleteSuccess",
                400: "error",
                500: "error",
            },
        })
    )
