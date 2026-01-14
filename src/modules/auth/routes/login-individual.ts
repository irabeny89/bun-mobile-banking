import { IndividualUserService } from "@/modules/Individual_user/service";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { AuthService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditService } from "@/modules/audit/service";
import { AuditModel } from "@/modules/audit/model";


export const loginIndividual = new Elysia({ name: "loginIndividual" })
    .model({
        login: AuthModel.loginSchema,
        loginSuccess: AuthModel.loginSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "login" }, app => app
        .resolve(async ({ body, store, server, request, headers }) => {
            return {
                user: await IndividualUserService.findByEmail(body.email),
                logger: pinoLogger(store),
                audit: {
                    action: "login",
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
        .post("/login/individual", async ({ logger, set, user, body, audit }) => {
            if (!user) {
                logger.info("loginIndividual:: no user found")
                set.status = 401
                await AuditService.queue.add("log", {
                    ...audit,
                    status: "failure",
                    details: { email: body.email, reason: "User not found" }
                })
                logger.info("loginIndividual:: audit log queued")
                return {
                    type: "error" as const,
                    error: { message: "Register or login to continue", code: ERROR_RESPONSE_CODES.UNAUTHORIZED, details: [] }
                }
            }
            audit.userId = user.id
            logger.info("loginIndividual:: comparing plain and hashed password")
            if (!(await Bun.password.verify(body.password, user.password))) {
                logger.info("loginIndividual:: invalid password")
                set.status = 400
                await AuditService.queue.add("log", {
                    ...audit,
                    status: "failure",
                    details: { email: body.email, reason: "Invalid credentials" }
                })
                logger.info("loginIndividual:: audit log queued")
                return {
                    type: "error" as const,
                    error: { message: "Invalid credentials", code: ERROR_RESPONSE_CODES.INVALID_CREDENTIALS, details: [] }
                }
            }
            if (user.mfaEnabled) {
                logger.info("loginIndividual:: MFA enable by user")
                const { id, email, userType, mfaEnabled } = user
                await AuthService.sendMfaOtp({ email, id, userType, logger })
                await AuditService.queue.add("log", {
                    ...audit,
                    details: { email: body.email, reason: "MFA OTP sent" }
                })
                logger.info("loginIndividual:: audit log queued")
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
            const payload: CommonSchema.TokenPayloadT = {
                id: user.id,
                userType: user.userType,
                email: user.email,
            }
            logger.info("loginIndividual:: user verified, generating access and refresh tokens")
            const { accessToken, refreshToken } = AuthService.createTokens(payload)
            logger.info("loginIndividual:: caching refresh token")
            await AuthService.cacheRefreshToken(refreshToken, payload.id)
            await AuditService.queue.add("log", {
                ...audit,
                details: { email: user.email }
            })
            logger.info("loginIndividual:: audit log queued")
            return {
                type: "success" as const,
                data: { accessToken, refreshToken, mfaEnabled: false, message: "Login successful" }
            }
        }, {
            detail: {
                tags: ["Auth", "Individual User"],
                description: "Login individual user. Will require MFA OTP is MFA enabled.",
                summary: "Login the Individual"
            },
            body: AuthModel.loginSchema,
            response: {
                200: "loginSuccess",
                400: "error",
                401: "error"
            },
        }))
