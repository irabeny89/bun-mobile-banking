import Elysia from "elysia";
import { AuthModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { AuthService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";

export const resetPasswordIndividual = new Elysia({
    name: "reset-password-individual",
})
    .model({
        resetPasswordIndividual: AuthModel.resetPasswordSchema,
        resetPasswordIndividualSuccess: AuthModel.resetPasswordSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "resetPasswordIndividual" }, app => app
        .resolve(async ({ store, body }) => {
            return {
                logger: pinoLogger(store),
                userData: await AuthService.getMfaOtpCachedData(body.otp)
            }
        })
        .post("/reset-password/individual", async ({ logger, body, userData }) => {
            const data = userData as CommonSchema.TokenPayloadT;
            logger.info("resetPasswordIndividual:: generating access and refresh tokens")
            const tokens = AuthService.createTokens(data)
            logger.info("resetPasswordIndividual:: caching refresh token")
            await AuthService.cacheRefreshToken(tokens.refreshToken, data.id);
            const hashedPassword = await Bun.password.hash(body.newPassword);
            logger.info("resetPasswordIndividual:: resetting password to new hashed password")
            await AuthService.resetPasswordIndividual(data.id, hashedPassword)
            logger.info("resetPasswordIndividual:: Success! returning access and refresh tokens")
            return {
                type: "success" as const,
                data: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken
                }
            }
        }, {
            beforeHandle: async ({ logger, userData, set }) => {
                if (!userData) {
                    logger.info("resetPasswordIndividual:: invalid token")
                    set.status = 400;
                    return {
                        type: "error" as const,
                        error: {
                            message: "Invalid token, retry forgot password.",
                            code: ERROR_RESPONSE_CODES.INVALID_TOKEN,
                            details: []
                        }
                    }
                }
            },
            detail: {
                tags: ["Auth", "Individual User"],
                description: "Reset password as individual user with OTP sent to your email.",
                summary: "Individual reset password"
            },
            body: "resetPasswordIndividual",
            response: {
                200: "resetPasswordIndividualSuccess",
                404: "error"
            },
        })
    )