import { AuthService } from "@/modules/auth/service";
import { IndividualUserService } from "@/modules/Individual_user/service";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";

export const userMacro = new Elysia({ name: "user-macro" })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .macro({
        user: (allowedTypes: CommonSchema.UserType[]) => ({
            async resolve({ logger, headers, status }) {
                const token = headers.authorization?.replace("Bearer ", "")
                if (!token) {
                    logger?.info("userMacro:: token not found")
                    return status(401, {
                        type: "error",
                        error: {
                            message: "Unauthorized",
                            code: "UNAUTHORIZED",
                            details: []
                        }
                    })
                }
                const payload = await AuthService.verifyToken(token, "access", "individual", logger)
                if (!payload) {
                    logger?.info("userMacro:: token not valid")
                    return status(401, {
                        type: "error",
                        error: {
                            message: "Unauthorized",
                            code: "UNAUTHORIZED",
                            details: []
                        }
                    })
                }
                if (!allowedTypes.includes(payload.userType)) {
                    logger?.debug({
                        allowedTypes,
                        userType: payload.userType
                    }, "userMacro:: user type not valid")
                    return status(401, {
                        type: "error",
                        error: {
                            message: "Unauthorized",
                            code: "UNAUTHORIZED",
                            details: []
                        }
                    })
                }
                return {
                    user: await IndividualUserService.getMe(payload.id)
                }
            }
        })
    })