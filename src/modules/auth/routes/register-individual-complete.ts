import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "@/config";
import { IndividualUserService } from "@/modules/Individual_user/service";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthService } from "../service";
import { AuthModel } from "../model";
import { jwtPlugin } from "@/plugins/jwt.plugin";

export const registerIndividualUserComplete = new Elysia({
    name: "registerIndividualUserComplete"
})
    .model({
        registerComplete: AuthModel.registerCompleteSchema,
        registerCompleteSuccess: AuthModel.registerCompleteSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "registerComplete" }, app => app
        .use(jwtPlugin)
        .resolve(async ({ body, store, set }) => {
            const logger = pinoLogger(store)
            const registerData = await AuthService.getUserRegisterData(body.otp)
            if (!registerData) {
                logger.info("auth:: invalid otp, no register data")
                set.status = 400
                return {
                    type: "error",
                    error: { message: "Invalid OTP", code: "INVALID_OTP", details: [] }
                }
            }
            logger.info("auth:: otp verified successfully")
            return { registerData, logger }
        })
        .post("/register/individual-user/complete", async ({ logger, jwt, registerData }) => {
            logger?.info("auth:: creating individual user")
            const res = await IndividualUserService.create(registerData!)
            logger?.info("auth:: individual user created successfully")
            const tokenPayload: CommonSchema.TokenPayloadT = {
                id: res.id,
                userType: res.userType,
                email: res.email,
            }
            logger?.info("auth:: generating access and refresh tokens")
            const accessToken = await jwt.sign({ payload: tokenPayload, exp: +ACCESS_TOKEN_TTL })
            const refreshToken = await jwt.sign({ payload: tokenPayload, exp: +REFRESH_TOKEN_TTL })
            logger?.info("auth:: caching refresh token")
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
                    logger?.info("auth:: no register data")
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
                    logger?.info("auth:: user already exists")
                    set.status = 400
                    return {
                        type: "error" as const,
                        error: { message: "User already exists", code: "USER_EXIST", details: [] }
                    }
                }
                logger?.debug(registerData, "auth:: register data verified successfully")
            },
            response: {
                200: "registerCompleteSuccess",
                400: "error",
                500: "error",
            },
        })
    )
