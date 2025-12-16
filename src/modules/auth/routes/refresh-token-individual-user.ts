import Elysia from "elysia";
import { AuthModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { AuthService } from "../service";

export const refreshTokenIndividualUser = new Elysia({
    name: "refreshTokenIndividualUser"
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
    .post("/refresh-token/individual-user", async ({ body, set, logger }) => {
        const jwtPayload = await AuthService.verifyToken(body.refreshToken, "refresh", "individual", logger);
        logger.debug({ jwtPayload }, "refreshTokenIndividualUser:: jwt payload")
        if (!jwtPayload) {
            logger.info("refreshTokenIndividualUser:: invalid refresh token")
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
        logger.info("refreshTokenIndividualUser:: refresh token verified successfully")
        // ensure not to include exp, iat, jti, nbf, sub in payload
        const payload = {
            id: jwtPayload.id,
            email: jwtPayload.email,
            userType: jwtPayload.userType
        }
        const { accessToken, refreshToken } = AuthService.createTokens(payload)
        logger.info("refreshTokenIndividualUser:: new access and refresh tokens generated")
        await AuthService.cacheRefreshToken(refreshToken, payload.id)
        logger.info("refreshTokenIndividualUser:: refresh token cached")
        return {
            type: "success",
            data: { accessToken, refreshToken, message: "Refresh token generated successfully" }
        }
    }, {
        detail: {
            tags: ["Auth", "Individual User"],
            description: "Refresh access token for individual user.",
        },
        body: "refreshToken",
        response: {
            200: "refreshTokenSuccess",
            400: "error",
            500: "error",
        },
    })