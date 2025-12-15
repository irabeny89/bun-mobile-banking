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
    .model({
        login: AuthModel.loginSchema,
        loginSuccess: AuthModel.loginSuccessSchema,
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
    .guard({ body: "login" }, app => app
        .resolve(async ({ body }) => {
            return { user: await IndividualUserService.findByEmail(body.email) }
        })
        .post("/login/individual-user", async ({ logger, jwt, set, user }) => {
            if (!user) {
                logger.info("auth:: no user found")
                set.status = 400
                return {
                    type: "error" as const,
                    error: { message: "No user found", code: "NO_USER_FOUND", details: [] }
                }
            }
            logger.info("auth:: user verified successfully")
            const tokenPayload: CommonSchema.TokenPayloadT = {
                id: user.id,
                userType: user.userType,
                email: user.email,
            }
            logger.info("auth:: generating access and refresh tokens")
            const accessToken = await jwt.sign({
                payload: tokenPayload,
                exp: +ACCESS_TOKEN_TTL
            })
            const refreshToken = await jwt.sign({
                payload: tokenPayload,
                exp: +REFRESH_TOKEN_TTL
            })
            logger.info("auth:: caching refresh token")
            await AuthService.cacheRefreshToken(refreshToken, tokenPayload.id)
            return {
                type: "success" as const,
                data: { accessToken, refreshToken, mfaEnabled: false, message: "Login successful" }
            }
        }, {
            detail: { description: "Login individual user." },
            body: AuthModel.loginSchema,
            beforeHandle: async ({ user, body, logger, set }) => {
                if (!user) {
                    logger.info("auth:: no user found")
                    set.status = 400
                    return {
                        type: "error" as const,
                        error: { message: "No user found", code: "NO_USER_FOUND", details: [] }
                    }
                }
                logger.debug({ pass: body.password, hash: user.password }, "auth:: comparing plain and hashed password")
                if (!(await Bun.password.verify(body.password, user.password))) {
                    logger.info("auth:: invalid password")
                    set.status = 400
                    return {
                        type: "error" as const,
                        error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", details: [] }
                    }
                }
                if (user.mfaEnabled) {
                    logger.info("MFA enable by user")
                    const { id, email, userType, mfaEnabled } = user
                    await AuthService.sendMfaOtp({ email, id, userType, logger })
                    return {
                        type: "success" as const,
                        data: {
                            accessToken: "",
                            refreshToken: "",
                            mfaEnabled,
                            message: "MFA OTP sent to your email. Use it to login."
                        }
                    }
                }
            },
            response: {
                200: "loginSuccess",
                400: "error",
                500: "error",
            },
        }))
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