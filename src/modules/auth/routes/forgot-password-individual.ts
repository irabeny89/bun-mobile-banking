import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { IndividualUserService } from "@/modules/Individual_user/service";
import { AuthService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";

export const forgotPasswordIndividual = new Elysia({
    name: "forgot-password-individual",
})
    .model({
        forgotPasswordIndividual: AuthModel.forgotPasswordSchema,
        forgotPasswordIndividualSuccess: AuthModel.forgotPasswordSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "forgotPasswordIndividual" }, app => app
        .resolve(async ({ store, body }) => {
            return {
                logger: pinoLogger(store),
                user: await IndividualUserService.findByEmail(body.email)
            }
        })
        .post("/forgot-password/individual", async ({ logger, user }) => {
            logger.info("forgotPasswordIndividual:: removing refresh token if it exists")
            await AuthService.removeRefreshToken(user.id)
            logger.info("forgotPasswordIndividual:: sending MFA OTP")
            await AuthService.sendMfaOtp({ email: user.email, id: user.id, logger, userType: user.userType })
            return {
                type: "success" as const,
                data: {
                    message: "Password reset request successful. Check your email for the reset code" as const,
                    nextStep: "Reset Password with OTP" as const
                }
            }
        }, {
            beforeHandle: async ({ user, logger, set }) => {
                if (!user) {
                    logger.info("forgotPasswordIndividual:: user not found")
                    set.status = 401
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
