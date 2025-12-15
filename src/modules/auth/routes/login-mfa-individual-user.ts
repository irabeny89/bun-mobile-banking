import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "@/config";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { AuthService } from "../service";
import { jwtPlugin } from "@/plugins/jwt.plugin";

export const loginMfaIndividualUser = new Elysia({
    name: "loginMfaIndividualUser"
})
    .model({
        loginMfaOtp: AuthModel.loginMfaOtpSchema,
        loginMfaOtpSuccess: AuthModel.loginMfaOtpSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .use(jwtPlugin)
    .guard({ body: "loginMfaOtp" }, app => app
        .resolve(async ({ store, body }) => {
            return { 
                logger: pinoLogger(store), 
                tokenPayload: await AuthService.getMfaOtpCachedData(body.otp) 
            }
        })
        .post("/login/mfa-otp/individual-user", async ({ logger, jwt, set, tokenPayload }) => {
            if (!tokenPayload) {
                logger.info("loginMfaIndividualUser:: invalid otp")
                set.status = 400
                return {
                    type: "error",
                    error: { message: "Invalid OTP", code: "INVALID_OTP", details: [] }
                }
            }
            logger.info(tokenPayload, "loginMfaIndividualUser:: generating access and refresh tokens with payload")
            const accessToken = await jwt.sign({ 
                payload: tokenPayload,
                exp: +ACCESS_TOKEN_TTL 
            })
            const refreshToken = await jwt.sign({ 
                payload: tokenPayload,
                exp: +REFRESH_TOKEN_TTL 
            })
            logger.info("loginMfaIndividualUser:: caching refresh token")
            await AuthService.cacheRefreshToken(refreshToken, tokenPayload.id)
            return {
                type: "success",
                data: { accessToken, refreshToken, message: "Login with MFA OTP successful" }
            }
        }, {
            detail: { description: "Login individual user with MFA OTP." },
            body: AuthModel.loginMfaOtpSchema,
            response: {
                200: "loginMfaOtpSuccess",
                400: "error",
                500: "error",
            },
        })
    )
