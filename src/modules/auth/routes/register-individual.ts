import { OTP_TTL } from "@/config";
import { IndividualUserService } from "@/modules/Individual_user/service";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { AuthService } from "../service";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditService } from "@/modules/audit/service";
import { AuditModel } from "@/modules/audit/model";


export const registerIndividual = new Elysia({ name: "registerIndividual" })
    .model({
        register: AuthModel.registerBodySchema,
        registerSuccess: AuthModel.registerSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .state("audit", {
        action: "register",
        userId: "unknown",
        userType: "individual",
        targetId: "unknown",
        targetType: "auth",
        status: "success",
        details: {},
        ipAddress: "unknown",
        userAgent: "unknown",
    } as AuditModel.CreateAuditT)
    .resolve(({ store, server, request, headers }) => {
        const logger = pinoLogger(store)
        return {
            logger,
            audit: {
                action: "register",
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
    .post("/register/individual", async ({ body, logger, audit }) => {
        logger.info("auth:: registering individual user")
        await AuthService.register(body, logger)
        await AuditService.queue.add("log", {
            ...audit,
            status: "success",
            details: { email: body.email }
        })
        logger.info("auth:: audit log queued")
        return {
            type: "success",
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
            logger.debug("auth:: hashed plain password")
        },
        response: {
            200: "registerSuccess",
            400: "error",
        },
    })