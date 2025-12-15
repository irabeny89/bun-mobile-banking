/** Controller handle HTTP related operations eg. routing, request validation */

import { AuthModel } from "./model";
import Elysia from "elysia";
import { AuthService } from "./service";
import { jwtPlugin } from "@/plugins/jwt.plugin";
import { ACCESS_TOKEN_TTL, OTP_TTL, REFRESH_TOKEN_TTL, SECRET_1 } from "@/config";
import pinoLogger from "@/utils/pino-logger";
import { CommonSchema } from "@/share/schema";
import { IndividualUserService } from "../Individual_user/service";

export const auth = new Elysia({
    prefix: "/auth",
    detail: {
        tags: ["Auth"],
        description:
            "Authentication and onboarding service to authenticate, authorize and onboard users.",
    },
})
    .use(jwtPlugin)
    .model({
        register: AuthModel.registerBodySchema,
        registerSuccess: AuthModel.registerSuccessSchema,
        registerComplete: AuthModel.registerCompleteSchema,
        registerCompleteSuccess: AuthModel.registerCompleteSuccessSchema,
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
    .post("/register/individual-user", async ({ body, logger }) => {
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
        detail: { description: "Register individual user. First step of the registration process." },
        body: AuthModel.registerBodySchema,
        beforeHandle: async ({ body, set, logger }) => {
            const userExist = await IndividualUserService.existByEmail(body.email)
            if (userExist) {
                logger.info("auth:: user already exists")
                set.status = 400
                return {
                    type: "error" as const,
                    error: { message: "User already exists", code: "USER_EXIST", details: [] }
                }
            }
            body.password = await Bun.password.hash(body.password)
            logger.debug("auth:: hashed plain password")
        },
        response: {
            200: "registerSuccess",
            400: "error",
            500: "error",
        },
    })
    .guard({ body: "registerComplete" }, app => app
        .resolve(async ({ body, logger, set }) => {
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
            return { registerData }
        })
        .post("/register/individual-user/complete", async ({ logger, jwt, set, registerData }) => {
            logger.info("auth:: creating individual user")
            const res = await IndividualUserService.create(registerData!)
            logger.info("auth:: individual user created successfully")
            const tokenPayload: CommonSchema.TokenPayloadT = {
                id: res.id,
                userType: res.userType,
                email: res.email,
            }
            logger.info("auth:: generating access and refresh tokens")
            const accessToken = await jwt.sign({ payload: tokenPayload, exp: +ACCESS_TOKEN_TTL })
            const refreshToken = await jwt.sign({ payload: tokenPayload, exp: +REFRESH_TOKEN_TTL })
            logger.info("auth:: caching refresh token")
            await AuthService.cacheRefreshToken(refreshToken, tokenPayload.id)
            return {
                type: "success",
                data: { accessToken, refreshToken, message: "OTP verified successfully", }
            }
        }, {
            detail: { description: "Register individual user. Second and final step of the registration process." },
            body: "registerComplete",
            beforeHandle: async ({ registerData, set, logger }) => {
                if (!registerData) {
                    logger.info("auth:: no register data")
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
                    logger.info("auth:: user already exists")
                    set.status = 400
                    return {
                        type: "error" as const,
                        error: { message: "User already exists", code: "USER_EXIST", details: [] }
                    }
                }
                logger.debug(registerData, "auth:: register data verified successfully")
            },
            response: {
                200: "registerCompleteSuccess",
                400: "error",
                500: "error",
            },
        })
    )
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