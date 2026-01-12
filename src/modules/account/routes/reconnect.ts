import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import pinoLogger from "@/utils/pino-logger";
import { AccountService } from "../service";
import { MonoConnectReauthAccountLinkingResponseData, MonoResponse } from "@/types/mono.type";

export const reconnect = new Elysia({ name: "reconnect" })
    .use(userMacro)
    .model({
        reconnectBody: AccountModel.reconnectBodySchema,
        reconnectSuccess: AccountModel.reconnectSuccessSchema,
        error: CommonSchema.errorSchema
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .post("/reconnect", async ({ user, logger, set, body }) => {
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
        const account = await AccountService.findByMonoAccountId(body.accountId)
        if (!account) {
            logger.error("reconnect:: Account not found")
            set.status = 404
            return {
                type: "error" as const,
                error: {
                    message: "Account not found",
                    code: ERROR_RESPONSE_CODES.NOT_FOUND,
                    details: []
                }
            }
        }
        const res = await AccountService.monoReauthorizeAccount({
            account: body.accountId,
            redirect_url: "/",
            meta: { ref: account.monoReference },
            scope: "reauth"
        })
        if (!res.ok) {
            const { message } = await res.json() as MonoResponse
            logger.error({ responseMsg: message }, "reconnect:: Mono reauthorize account failed")
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
        const { data } = await res.json() as MonoResponse<MonoConnectReauthAccountLinkingResponseData>
        await AccountService.queue.add("update-mfa", {
            userId: user.id,
            accountId: body.accountId,
            mfa: data.is_multi
        })
        return {
            type: "success" as const,
            data: {
                accountId: body.accountId,
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
        body: "reconnectBody",
        response: {
            200: "reconnectSuccess",
            401: "error",
            404: "error",
            500: "error"
        }
    })