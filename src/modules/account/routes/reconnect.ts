import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import pinoLogger from "@/utils/pino-logger";
import { AccountService } from "../service";
import { MonoConnectReauthAccountLinkingResponseData } from "@/types/mono.type";

export const reconnect = new Elysia({ name: "reconnect" })
    .use(userMacro)
    .model({
        reconnectSuccess: AccountModel.reconnectSuccessSchema,
        error: CommonSchema.errorSchema
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .post("/reconnect", async ({ user, logger, set }) => {
        if (!user) {
            logger.error("reconnect:: User not found")
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
        const account = await AccountService.findByUserId(user.id)
        if (!account) {
            logger.error("reconnect:: Account not found")
            set.status = 500
            return {
                type: "error" as const,
                error: {
                    message: "Account not found",
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    details: []
                }
            }
        }
        const res = await AccountService.monoReauthorizeAccount({
            account: account.monoAccountId,
            redirect_url: "",
            meta: { ref: account.monoReference },
            scope: "reauth"
        })
        if (!res.ok) {
            logger.error("reconnect:: Mono reauthorize account failed")
            set.status = 500
            return {
                type: "error" as const,
                error: {
                    message: "Mono reauthorize account failed",
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    details: []
                }
            }
        }
        const data = await res.json() as MonoConnectReauthAccountLinkingResponseData
        await AccountService.queue.add("update-institution", {
            userId: user.id,
            reference: data.meta.ref,
            institutionId: data.institution.id,
            institutionAuthMethod: data.institution.auth_method,
            mfa: data.is_multi
        })
        return {
            type: "success" as const,
            data: {
                accountId: account.monoAccountId,
                message: "Account reconnected successfully"
            }
        }
    }, {
        user: ["individual"],
        detail: {
            tags: ["Account", "Individual User"],
            description: "Reconnect your bank account",
            summary: "Reconnect bank account"
        },
        response: {
            200: "reconnectSuccess",
            401: "error",
            500: "error"
        }
    })