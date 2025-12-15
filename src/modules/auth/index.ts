/** Controller handle HTTP related operations eg. routing, request validation */

import { AuthModel } from "./model";
import Elysia from "elysia";
import { AuthService } from "./service";
import { jwtPlugin } from "@/plugins/jwt.plugin";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "@/config";
import pinoLogger from "@/utils/pino-logger";
import { CommonSchema } from "@/share/schema";
import { IndividualUserService } from "../Individual_user/service";
import { registerIndividualUser } from "./routes/register-individual-user";
import { registerIndividualUserComplete } from "./routes/register-individual-complete";
import { loginIndividualUser } from "./routes/login-individual-user";

export const auth = new Elysia({
    prefix: "/auth",
    detail: {
        tags: ["Auth"],
        description:
            "Authentication and onboarding service to authenticate, authorize and onboard users.",
    },
})
    .use(jwtPlugin)
    .use(registerIndividualUser)
    .use(registerIndividualUserComplete)
    .use(loginIndividualUser)
    .model({
        loginMfaOtp: AuthModel.loginMfaOtpSchema,
        loginMfaOtpSuccess: AuthModel.loginMfaOtpSuccessSchema,
        refreshToken: AuthModel.refreshTokenSchema,
        refreshTokenSuccess: AuthModel.refreshTokenSuccessSchema,
        forgotPassword: AuthModel.forgotPasswordSchema,
        forgotPasswordSuccess: AuthModel.forgotPasswordSuccessSchema,
        resetPassword: AuthModel.resetPasswordSchema,
        resetPasswordSuccess: AuthModel.resetPasswordSuccessSchema,
        logout: AuthModel.logoutSchema,
        logoutSuccess: AuthModel.logoutSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .post("/login/mfa-otp/individual-user", async ({ body, logger, jwt, set }) => {
        logger.info("auth:: logging in individual user with mfa otp")
        const res = await AuthService.loginMfaOtp({ body, logger })
        if (res === "invalid otp") {
            set.status = 400
            return {
                type: "error",
                error: { message: "Invalid OTP", code: "INVALID_OTP", details: [] }
            }
        }
        const tokenPayload: CommonSchema.TokenPayloadT = {
            id: res.id,
            userType: res.userType,
            email: res.email,
        }
        logger.info(tokenPayload, "auth:: generating access and refresh tokens with payload")
        const accessToken = await jwt.sign({ payload: tokenPayload, exp: +ACCESS_TOKEN_TTL })
        const refreshToken = await jwt.sign({ payload: tokenPayload, exp: +REFRESH_TOKEN_TTL })
        logger.info("auth:: caching refresh token")
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