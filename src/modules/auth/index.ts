/** Controller handle HTTP related operations eg. routing, request validation */

import db from "@/utils/db";
import { AuthModel } from "./model";
import Elysia from "elysia";
import { AuthService } from "./service";

export const user = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["Auth"],
    description:
      "Authentication and onboarding service to authenticate, authorize and onboard users.",
  },
}).model({
  register: AuthModel.registerSchema,
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
}).resolve(() => ({ sql: db() })).post("/register", ({ body, sql }) => {
  const res = AuthService.register(sql, body)
}, {
  body: AuthModel.registerSchema,
  response: AuthModel.registerSuccessSchema,
  beforeHandle({ body }) {
    
  }
})