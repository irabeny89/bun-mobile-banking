import Elysia from "elysia";
import { AuthModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { AuthService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

export const refreshTokenIndividual = new Elysia({
    name: "refreshTokenIndividual"
})
    .model({
        refreshToken: AuthModel.refreshTokenSchema,
        refreshTokenSuccess: AuthModel.refreshTokenSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .state("audit", {
        action: "refresh_token",
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
        store.audit.ipAddress = server?.requestIP(request)?.address
        store.audit.userAgent = headers["user-agent"]
        return {
            logger: pinoLogger(store),
        }
    })
    .post("/refresh-token/individual", async ({ body, set, logger, store }) => {
        const jwtPayload = await AuthService.verifyToken(body.refreshToken, "refresh", "individual", logger);
        logger.debug({ jwtPayload }, "refreshTokenIndividual:: jwt payload")
        if (!jwtPayload) {
            logger.info("refreshTokenIndividual:: invalid refresh token")
            set.status = 400
            await AuditService.queue.add("log", {
                ...store.audit,
                status: "failure",
                details: { reason: "Invalid refresh token" }
            })
            logger.info("refreshTokenIndividual:: audit log queued")
            return {
                type: "error",
                error: {
                    message: "Invalid refresh token",
                    code: ERROR_RESPONSE_CODES.INVALID_TOKEN,
                    details: []
                }
            }
        }
        logger.info("refreshTokenIndividual:: refresh token verified successfully")
        // ensure not to include exp, iat, jti, nbf, sub in payload
        const payload = {
            id: jwtPayload.id,
            email: jwtPayload.email,
            userType: jwtPayload.userType
        }
        const { accessToken, refreshToken } = AuthService.createTokens(payload)
        logger.info("refreshTokenIndividual:: new access and refresh tokens generated")
        await AuthService.cacheRefreshToken(refreshToken, payload.id)
        logger.info("refreshTokenIndividual:: refresh token cached")
        await AuditService.queue.add("log", {
            ...store.audit,
            status: "success",
            details: { reason: "Refresh token generated successfully" }
        })
        logger.info("refreshTokenIndividual:: audit log queued")
        return {
            type: "success",
            data: { accessToken, refreshToken, message: "Refresh token generated successfully" }
        }
    }, {
        detail: {
            tags: ["Auth", "Individual User"],
            description: "Refresh access token for individual user.",
            summary: "Refresh tokens"
        },
        body: "refreshToken",
        response: {
            200: "refreshTokenSuccess",
            400: "error",
            500: "error",
        },
    })