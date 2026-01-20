import { OTP_TTL, REGISTER_CACHE_KEY } from "@/config";
import { IndividualUserService } from "@/modules/Individual_user/service";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditService } from "@/modules/audit/service";
import { AuditModel } from "@/modules/audit/model";
import cacheSingleton, { getCacheKey } from "@/utils/cache";
import { emailQueue } from "@/utils/email-queue";
import { genOTP } from "@/utils/otp";

export const registerIndividual = new Elysia({ name: "registerIndividual" })
    .model({
        register: AuthModel.registerBodySchema,
        registerSuccess: AuthModel.registerSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store, server, request, headers }) => {
        const logger = pinoLogger(store)
        return {
            logger,
            audit: {
                action: "register",
                userId: null,
                userType: "individual",
                targetId: null,
                targetType: "auth",
                status: "success",
                details: {},
                ipAddress: server?.requestIP(request)?.address,
                userAgent: headers["user-agent"],
            } as AuditModel.CreateAuditT
        }
    })
    .post("/register/individual", async ({ body, logger, audit }) => {
        const otp = await genOTP()
        logger.info({ otp }, "auth:: OTP generated")
        const cache = cacheSingleton();
        const cacheKey = getCacheKey(REGISTER_CACHE_KEY, otp);
        await cache.set(cacheKey, JSON.stringify(body))
        await cache.expire(cacheKey, OTP_TTL)
        logger.info("auth:: user registration data cached")
        await Promise.all([
            emailQueue.add("email-verify", {
                otp,
                email: body.email,
                name: "Anonymous User",
                subject: "Email Verification"
            }),
            AuditService.queue.add("log", {
                ...audit,
                status: "success",
                details: { email: body.email }
            })
        ])
        logger.info("auth:: email and audit log queued")
        return {
            type: "success" as const,
            data: {
                nextStep: "verify email",
                message: `Check your email to complete your registration within ${OTP_TTL / 60} minutes.`
            }
        }
    }, {
        detail: {
            tags: ["Auth", "Individual User"],
            description: "Register individual user. First step of the registration process.",
            summary: "Registration individual start"
        },
        body: AuthModel.registerBodySchema,
        beforeHandle: async ({ body, set, logger, audit }) => {
            const userExist = await IndividualUserService.existByEmail(body.email)
            if (userExist) {
                logger.info("auth:: user already exists")
                set.status = 400
                await AuditService.queue.add("log", {
                    ...audit,
                    status: "failure",
                    details: { email: body.email, reason: "User already exists" }
                })
                logger.info("auth:: audit log queued")
                return {
                    type: "error" as const,
                    error: {
                        message: "User already exists",
                        code: ERROR_RESPONSE_CODES.BAD_REQUEST,
                        details: []
                    }
                }
            }
            body.password = await Bun.password.hash(body.password)
            logger.info("auth:: hashed plain password")
        },
        response: {
            200: "registerSuccess",
            400: "error",
        },
    })