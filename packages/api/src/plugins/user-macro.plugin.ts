import { AuthService } from "@/modules/auth/service";
import { IndividualUserService } from "@/modules/Individual_user/service";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";

export const userMacro = new Elysia({ name: "user-macro" })
    .resolve(({ store }) => ({ logger: pinoLogger(store) }))
    .macro({
        user: (allowedTypes: CommonSchema.UserType[]) => ({
            async resolve({ logger, headers, set }) {
                const token = headers.authorization?.replace("Bearer ", "")
                if (!token) {
                    logger?.info("userMacro:: token not found")
                    set.status = 401
                    return {
                        type: "error",
                        error: {
                            message: "Unauthorized",
                            code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                            details: []
                        }
                    }
                }
                const payload = await AuthService.verifyToken(token, "access", "individual", logger)
                if (!payload) {
                    logger?.info("userMacro:: token not valid")
                    set.status = 401
                    return {
                        type: "error",
                        error: {
                            message: "Unauthorized",
                            code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                            details: []
                        }
                    }
                }
                if (!allowedTypes.includes(payload.userType)) {
                    logger?.debug({
                        allowedTypes,
                        userType: payload.userType
                    }, "userMacro:: user type not valid")
                    set.status = 401
                    return {
                        type: "error",
                        error: {
                            message: "Unauthorized",
                            code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                            details: []
                        }
                    }
                }
                return {
                    user: await IndividualUserService.getMe(payload.id)
                }
            }
        })
    })