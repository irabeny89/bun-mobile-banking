import { userMacro } from "@/plugins/user-macro.plugin";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AccountService } from "../service";
import { MonoResponse, MonoConnectAuthAccountExchangeTokenResponseData } from "@/types/mono.type";
import { AuditService } from "@/modules/audit/service";
import { AuditModel } from "@/modules/audit/model";


export const exchange = new Elysia({ name: "exchange" })
    .use(userMacro)
    .model({
        exchangeBody: AccountModel.exchangeBodySchema,
        exchangeSuccess: AccountModel.exchangeSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .state("audit", {
        action: "account_linking_complete",
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
    .post("/exchange", async ({ user, logger, set, body, store }) => {
        if (!user) {
            logger.error("exchange:: User not found")
            set.status = 401
            await AuditService.queue.add("log", {
                ...store.audit,
                status: "failure",
                details: { reason: "User not found" }
            });
            logger.info("exchange:: audit log queued")
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
        const res = await AccountService.monoExchangeToken({
            code: body.connectToken,
        })
        if (!res.ok) {
            logger.error("exchange:: Failed to exchange connect token")
            set.status = 500
            await AuditService.queue.add("log", {
                ...store.audit,
                status: "failure",
                details: { reason: "Failed to exchange connect token" }
            });
            logger.info("exchange:: audit log queued")
            return {
                type: "error" as const,
                error: {
                    message: "Failed to exchange connect token",
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    details: []
                }
            }
        }
        const { data: { id } } = await res.json() as MonoResponse<MonoConnectAuthAccountExchangeTokenResponseData>
        await AuditService.queue.add("log", {
            ...store.audit,
            targetId: id,
            details: { accountId: id }
        });
        logger.info("exchange:: audit log queued")

        return {
            type: "success" as const,
            data: {
                accountId: id,
                message: "Account linked successfully"
            }
        }
    }, {
        body: "exchangeBody",
        user: ["individual"],
        detail: {
            tags: ["Account", "Individual User"],
            description: "Exchange your bank account",
            summary: "Exchange bank account"
        },
        response: {
            200: "exchangeSuccess",
            401: "error",
            500: "error"
        }
    })