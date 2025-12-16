import { IndividualUserService } from "@/modules/Individual_user/service";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { AuthService } from "../service";

export const loginIndividual = new Elysia({ name: "loginIndividual" })
    .model({
        login: AuthModel.loginSchema,
        loginSuccess: AuthModel.loginSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .guard({ body: "login" }, app => app
        .resolve(async ({ body, store }) => {
            return {
                user: await IndividualUserService.findByEmail(body.email),
                logger: pinoLogger(store)
            }
        })
        .post("/login/individual", async ({ logger, set, user, body }) => {
            if (!user) {
                logger.info("loginIndividual:: no user found")
                set.status = 400
                return {
                    type: "error" as const,
                    error: { message: "No user found", code: "NO_USER_FOUND", details: [] }
                }
            }
            logger.debug({ pass: body.password, hash: user.password }, "loginIndividual:: comparing plain and hashed password")
            if (!(await Bun.password.verify(body.password, user.password))) {
                logger.info("loginIndividual:: invalid password")
                set.status = 400
                return {
                    type: "error" as const,
                    error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", details: [] }
                }
            }
            if (user.mfaEnabled) {
                logger.info("loginIndividual:: MFA enable by user")
                const { id, email, userType, mfaEnabled } = user
                await AuthService.sendMfaOtp({ email, id, userType, logger })
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
            },
        }))
