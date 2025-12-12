/** Controller handle HTTP related operations eg. routing, request validation */

import { AuthModel } from "./model";
import Elysia from "elysia";
import { AuthService } from "./service";
import { jwtPlugin } from "@/plugins/jwt.plugin";
import { OTP_TTL } from "@/config";
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
    verify: AuthModel.verifySchema,
    verifySuccess: AuthModel.verifySuccessSchema,
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
      data: { message: `Check your email to complete your registration within ${OTP_TTL / 60} minutes.` }
    }
  }, {
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
  })