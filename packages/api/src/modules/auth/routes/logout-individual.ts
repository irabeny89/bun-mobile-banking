import Elysia from "elysia";
import { AuthModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { AuthService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

export const logoutIndividual = new Elysia({ name: "logout-individual" })
    .model({
        logoutIndividual: AuthModel.logoutSchema,
        logoutIndividualSuccess: AuthModel.logoutSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store, server, request, headers }) => {
        return {
            logger: pinoLogger(store),
            audit: {
                action: "logout",
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
    .post("/logout/individual", async ({ logger, body, set, audit }) => {
        const payload = await AuthService.verifyToken(body.refreshToken, "refresh", "individual", logger);
        if (!payload) {
            logger.info("logoutIndividual:: invalid token")
            set.status = 400;
            await AuditService.queue.add("log", {
                ...audit,
                status: "failure",
                details: { refreshToken: body.refreshToken }
            })
            logger.info("logoutIndividual:: audit log queued")
            return {
                type: "error" as const,
                error: {
                    code: ERROR_RESPONSE_CODES.INVALID_TOKEN,
                    message: "Invalid refresh token",
                    details: []
                }
            }
        }
        await AuthService.removeRefreshToken(payload.id)
        logger.info("logoutIndividual:: auth session removed");
        await AuditService.queue.add("log", {
            ...audit,
            userId: payload.id,
            details: { email: payload.email }
        })
        logger.info("logoutIndividual:: audit log queued")
        return {
            type: "success" as const,
            data: { message: "Logged out successfully" }
        }
    }, {
        detail: {
            tags: ["Auth", "Individual User"],
            description: "Logout individual user.",
            summary: "Logout individual"
        },
        body: "logoutIndividual",
        response: {
            200: "logoutIndividualSuccess",
            400: "error",
            500: "error",
        },
    })

