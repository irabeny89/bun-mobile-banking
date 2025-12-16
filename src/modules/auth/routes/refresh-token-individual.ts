import Elysia from "elysia";
import { AuthModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { AuthService } from "../service";

export const refreshTokenIndividual = new Elysia({
    name: "refreshTokenIndividual"
})
    .model({
        refreshToken: AuthModel.refreshTokenSchema,
        refreshTokenSuccess: AuthModel.refreshTokenSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        return {
            logger: pinoLogger(store),
        }
    })
    .post("/refresh-token/individual", async ({ body, set, logger }) => {
        const jwtPayload = await AuthService.verifyToken(body.refreshToken, "refresh", "individual", logger);
        logger.debug({ jwtPayload }, "refreshTokenIndividual:: jwt payload")
        if (!jwtPayload) {
            logger.info("refreshTokenIndividual:: invalid refresh token")
            set.status = 400
            return {
                type: "error",
                error: {
                    message: "Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN",
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