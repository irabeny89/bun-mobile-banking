/** Controller handle HTTP related operations eg. routing, request validation */

import { AuthModel } from "./model";
import Elysia from "elysia";
import { AuthService } from "./service";
import { jwtPlugin } from "@/plugins/jwt.plugin";
import { ACCESS_TOKEN_TTL, OTP_TTL, REFRESH_TOKEN_TTL, SECRET_1 } from "@/config";
import pinoLogger from "@/utils/pino-logger";

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
    refreshToken: AuthModel.refreshTokenSchema,
    refreshTokenSuccess: AuthModel.refreshTokenSuccessSchema,
    forgotPassword: AuthModel.forgotPasswordSchema,
    forgotPasswordSuccess: AuthModel.forgotPasswordSuccessSchema,
    resetPassword: AuthModel.resetPasswordSchema,
    resetPasswordSuccess: AuthModel.resetPasswordSuccessSchema,
    logout: AuthModel.logoutSchema,
    logoutSuccess: AuthModel.logoutSuccessSchema,
  })
  .resolve(({ store }) => {
    const logger = pinoLogger(store)
    return {
      logger
    }
  })
  .post("/register/individual-user", async ({ body, logger, set }) => {
    logger.info("auth:: registering individual user")
    const res = await AuthService.register(body, logger)
    if (res === "user exist") {
      set.status = 400
      return {
        type: "error",
        error: { message: "User already exists", code: "USER_EXIST", details: [] }
      }
    }
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
    response: {
      200: AuthModel.registerSuccessSchema,
      400: AuthModel.errorSchema,
      500: AuthModel.errorSchema,
    },
    async beforeHandle({ body, logger }) {
      body.password = await Bun.password.hash(body.password);
      logger.debug({ hash: body.password }, "auth:: hashed plain password")
    }
  }).post("/register/individual-user/complete", async ({ body, logger, jwt, set }) => {
    logger.info("auth:: verifying email")
    const res = await AuthService.registerComplete({ body, logger })
    if (res === "invalid otp") {
      set.status = 400
      return {
        type: "error",
        error: { message: "Invalid OTP", code: "INVALID_OTP", details: [] }
      }
    }
    else if (res === "user exist") {
      set.status = 400
      return {
        type: "error",
        error: { message: "User already exists", code: "USER_EXIST", details: [] }
      }
    } else {
      const tokenPayload: AuthModel.TokenPayloadT = {
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
    }
  }, {
    detail: { description: "Register individual user. Second and final step of the registration process." },
    body: AuthModel.registerCompleteSchema,
    response: {
      200: AuthModel.registerCompleteSuccessSchema,
      400: AuthModel.errorSchema,
      500: AuthModel.errorSchema,
    },
  })