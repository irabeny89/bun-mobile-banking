import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { AuthService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";

export const loginMfaIndividual = new Elysia({
    name: "loginMfaIndividual"
})
    .model({
        loginMfaOtp: AuthModel.loginMfaOtpSchema,
        loginMfaOtpSuccess: AuthModel.loginMfaOtpSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "loginMfaOtp" }, app => app
        .resolve(async ({ store, body }) => {
            return {
                logger: pinoLogger(store),
                payload: await AuthService.getMfaOtpCachedData(body.otp)
            }
        })
        .post("/login/mfa-otp/individual", async ({ logger, set, payload }) => {
            if (!payload) {
                logger.info("loginMfaIndividual:: invalid otp")
                set.status = 400
                return {
                    type: "error" as const,
                    error: { 
                        message: "Invalid OTP", 
                        code: ERROR_RESPONSE_CODES.INVALID_OTP, 
                        details: [] 
                    }
                }
            }
            logger.info(payload, "loginMfaIndividual:: generating access and refresh tokens with payload")
            const { accessToken, refreshToken } = AuthService.createTokens(payload)
            logger.info("loginMfaIndividual:: caching refresh token")
            await AuthService.cacheRefreshToken(refreshToken, payload.id)
            return {
                type: "success",
                data: { accessToken, refreshToken, message: "Login with MFA OTP successful" }
            }
        }, {
            tags: ["Auth", "Individual User"],
            detail: { 
                description: "Login individual user with MFA OTP.",
                summary: "MFA OTP login"
            },
            body: AuthModel.loginMfaOtpSchema,
            response: {
                200: "loginMfaOtpSuccess",
                400: "error",
                500: "error",
            },
        })
    )
