import { userMacro } from "@/plugins/user-macro.plugin";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import pinoLogger from "@/utils/pino-logger";
import { AccountService } from "../service";
import { MonoConnectReauthAccountLinkingResponseData, MonoResponse } from "@/types/mono.type";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

export const reconnect = new Elysia({ name: "reconnect" })
    .use(userMacro)
    .model({
        reconnectBody: AccountModel.reconnectBodySchema,
        reconnectSuccess: AccountModel.reconnectSuccessSchema,
        error: CommonSchema.errorSchema
    })
    .state("audit", {
        action: "account_linking_reconnect",
        userId: "unknown",
        userType: "individual",
        targetId: "unknown",
        targetType: "account",
        status: "success",
        details: {},
        ipAddress: "unknown",
        userAgent: "unknown",
    } as AuditModel.CreateAuditT)
    .resolve(({ store, server, request, headers }) => {
        store.audit.ipAddress = server?.requestIP(request)?.address || "unknown"
        store.audit.userAgent = headers["user-agent"] || "unknown"
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .post("/reconnect", async ({ user, logger, set, body, store }) => {
        store.audit.targetId = body.accountId
        if (!user) {
            logger.error("reconnect:: User not found")
            set.status = 401
            await AuditService.queue.add("log", {
                ...store.audit,
                status: "failure",
                details: { reason: "User not found" }
            })
            logger.info("reconnect:: audit log queued")
            return {
                type: "error" as const,
                error: {
                    message: "Unauthorized",
                    code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                    details: []
                }
            }
        }
        store.audit.userId = user.id
        const account = await AccountService.findByMonoAccountId(body.accountId)
        if (!account) {
            logger.error("reconnect:: Account not found")
            set.status = 404
            await AuditService.queue.add("log", {
                ...store.audit,
                status: "failure",
                details: { reason: "Account not found", accountId: body.accountId }
            })
            logger.info("reconnect:: audit log queued")
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
            await AuditService.queue.add("log", {
                ...store.audit,
                status: "failure",
                details: { 
                    reason: "Mono reauthorize account failed", 
                    accountId: body.accountId,
                    responseMsg: message
                }
            })
            logger.info("reconnect:: audit log queued")
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
        await AuditService.queue.add("log", {
            ...store.audit,
            details: { 
                reason: "Account reconnected successfully", 
                accountId: body.accountId,
                mfa: data.is_multi
            }
        })
        logger.info("reconnect:: audit log queued")
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