import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { AuthService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditService } from "@/modules/audit/service";
import { AuditModel } from "@/modules/audit/model";

export const loginMfaIndividual = new Elysia({
    name: "loginMfaIndividual"
})
    .model({
        loginMfaOtp: AuthModel.loginMfaOtpSchema,
        loginMfaOtpSuccess: AuthModel.loginMfaOtpSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "loginMfaOtp" }, app => app
        .resolve(async ({ store, body, server, request, headers }) => {
            return {
                logger: pinoLogger(store),
                payload: await AuthService.getMfaOtpCachedData(body.otp),
                audit: {
                    action: "mfa_login",
                    userId: "unknown",
                    userType: "individual",
                    targetId: "unknown",
                    targetType: "auth",
                    status: "success",
                    details: {},
                    ipAddress: server?.requestIP(request)?.address || "unknown",
                    userAgent: headers["user-agent"] || "unknown",
                } as AuditModel.CreateAuditT
            }
        })
        .post("/login/mfa-otp/individual", async ({ logger, set, payload, audit, body }) => {
            if (!payload) {
                logger.info("loginMfaIndividual:: invalid otp")
                set.status = 400
                await AuditService.queue.add("log", {
                    ...audit,
                    status: "failure",
                    details: { reason: "Invalid OTP", otp: body.otp }
                })
                logger.info("loginMfaIndividual:: audit log queued")
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
            await AuditService.queue.add("log", {
                ...audit,
                userId: payload.id,
                details: { email: payload.email }
            })
            logger.info("loginMfaIndividual:: audit log queued")
            return {
                type: "success" as const,
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
