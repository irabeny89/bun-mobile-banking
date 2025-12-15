import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "@/config";
import { IndividualUserService } from "@/modules/Individual_user/service";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AuthModel } from "../model";
import { AuthService } from "../service";
import { jwtPlugin } from "@/plugins/jwt.plugin";

export const loginIndividualUser = new Elysia({ name: "loginIndividualUser" })
    .model({
        login: AuthModel.loginSchema,
        loginSuccess: AuthModel.loginSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .use(jwtPlugin)
    .guard({ body: "login" }, app => app
        .resolve(async ({ body, store }) => {
            return {
                user: await IndividualUserService.findByEmail(body.email),
                logger: pinoLogger(store)
            }
        })
        .post("/login/individual-user", async ({ logger, jwt, set, user, body }) => {
            if (!user) {
                logger.info("loginIndividualUser:: no user found")
                set.status = 400
                return {
                    type: "error" as const,
                    error: { message: "No user found", code: "NO_USER_FOUND", details: [] }
                }
            }
            logger.debug({ pass: body.password, hash: user.password }, "loginIndividualUser:: comparing plain and hashed password")
            if (!(await Bun.password.verify(body.password, user.password))) {
                logger.info("loginIndividualUser:: invalid password")
                set.status = 400
                return {
                    type: "error" as const,
                    error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", details: [] }
                }
            }
            if (user.mfaEnabled) {
                logger.info("loginIndividualUser:: MFA enable by user")
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
            const tokenPayload: CommonSchema.TokenPayloadT = {
                id: user.id,
                userType: user.userType,
                email: user.email,
            }
            logger.info("loginIndividualUser:: user verified, generating access and refresh tokens")
            const accessToken = await jwt.sign({
                payload: tokenPayload,
                exp: +ACCESS_TOKEN_TTL
            })
            const refreshToken = await jwt.sign({
                payload: tokenPayload,
                exp: +REFRESH_TOKEN_TTL
            })
            logger.info("loginIndividualUser:: caching refresh token")
            await AuthService.cacheRefreshToken(refreshToken, tokenPayload.id)
            return {
                type: "success" as const,
                data: { accessToken, refreshToken, mfaEnabled: false, message: "Login successful" }
            }
        }, {
            detail: {
                tags: ["Auth", "Individual User"],
                description: "Login individual user."
            },
            body: AuthModel.loginSchema,
            response: {
                200: "loginSuccess",
                400: "error",
                500: "error",
            },
        }))
