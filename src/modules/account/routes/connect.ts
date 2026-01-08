import { userMacro } from "@/plugins/user-macro.plugin";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AccountService } from "../service";

export const connect = new Elysia({ name: "connect" })
    .use(userMacro)
    .model({
        connectSuccess: AccountModel.connectSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .get("/connect", async ({ user, logger, set }) => {
        if (!user) {
            logger.error("connect:: User not found")
            set.status = 401
            return {
                type: "error" as const,
                error: {
                    message: "Unauthorized",
                    code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                    details: []
                }
            }
        }
        try {
            const connectUrl = await AccountService.getConnectUrl(user.id, user.email)
            return {
                type: "success" as const,
                data: {
                    message: "Click the link to connect your account",
                    connectUrl
                }
            }
        } catch (error: any) {
            if ((error.message as string).startsWith("Account linking failed")) {
                logger.error(error, "connect:: Failed to get connect url")
                set.status = 500
                return {
                    type: "error" as const,
                    error: {
                        message: "Failed to connect to your account",
                        code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                        details: []
                    }
                }
            }
            throw error
        }
    }, {
        user: ["individual"],
        detail: {
            tags: ["Account", "Individual User"],
            description: "Connect to your bank account",
            summary: "Link bank account"
        },
        response: {
            200: "connectSuccess",
            401: "error",
            500: "error"
        }
    })