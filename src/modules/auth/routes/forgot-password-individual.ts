import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { IndividualUserService } from "@/modules/Individual_user/service";
import { AuthService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

export const forgotPasswordIndividual = new Elysia({
    name: "forgot-password-individual",
})
    .model({
        forgotPasswordIndividual: AuthModel.forgotPasswordSchema,
        forgotPasswordIndividualSuccess: AuthModel.forgotPasswordSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "forgotPasswordIndividual" }, app => app
        .resolve(async ({ body, store, server, request, headers }) => {
            return {
                logger: pinoLogger(store),
                user: await IndividualUserService.findByEmail(body.email),
                audit: {
                    action: "forgot_password",
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
        .post("/forgot-password/individual", async ({ logger, user, audit }) => {
            logger.info("forgotPasswordIndividual:: removing refresh token if it exists")
            await AuthService.removeRefreshToken(user.id)
            logger.info("forgotPasswordIndividual:: sending MFA OTP")
            await AuthService.sendMfaOtp({ email: user.email, id: user.id, logger, userType: user.userType })
            await AuditService.queue.add("log", {
                ...audit,
                status: "success",
                details: { reason: "Password reset request successful. Check your email for the reset code" }
            })
            logger.info("forgotPasswordIndividual:: audit log queued")
            return {
                type: "success" as const,
                data: {
                    message: "Password reset request successful. Check your email for the reset code" as const,
                    nextStep: "Reset Password with OTP" as const
                }
            }
        }, {
            beforeHandle: async ({ user, logger, set, audit, body }) => {
                if (!user) {
                    logger.info("forgotPasswordIndividual:: user not found")
                    set.status = 401
                    await AuditService.queue.add("log", {
                        ...audit,
                        status: "failure",
                        details: { email: body.email, reason: "User not found" }
                    })
                    logger.info("forgotPasswordIndividual:: audit log queued")
                    return {
                        type: "error" as const,
                        error: {
                            message: "Register or login to continue",
                            code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                            details: []
                        }
                    }
                }
            },
            detail: {
                tags: ["Auth", "Individual User"],
                description: "Forgot password as individual user then request for OTP to reset it.",
                summary: "Individual forgot password"
            },
            body: "forgotPasswordIndividual",
            response: {
                200: "forgotPasswordIndividualSuccess",
                401: "error"
            },
        })
    )
