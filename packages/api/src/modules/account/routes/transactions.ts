import { CACHE_GET } from "@/config";
import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES, CACHE_GET_HEADER_VALUE } from "@/types";
import { MonoResponse, MonoAccountTransactionsResponseData } from "@/types/mono.type";
import cacheSingleton, { getCacheKey } from "@/utils/cache";
import { decrypt } from "@/utils/encryption";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { AccountService } from "../service";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

const cache = cacheSingleton()
export const transactions = new Elysia({ name: "transactions" })
    .use(userMacro)
    .model({
        transactionsParams: AccountModel.transactionsParamsSchema,
        transactionsQuery: AccountModel.transactionsQuerySchema,
        transactionsSuccess: AccountModel.transactionsSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store, server, request, headers }) => ({
        logger: pinoLogger(store),
        audit: {
            action: "list_account_transactions",
            userId: "unknown",
            userType: "individual",
            targetId: "unknown",
            targetType: "account",
            status: "success",
            details: {},
            ipAddress: server?.requestIP(request)?.address || "unknown",
            userAgent: headers["user-agent"] || "unknown",
        } satisfies AuditModel.CreateAuditT
    }))
    .get("/:accountId/transactions", async ({ user, logger, set, query, params, audit }) => {
        const userId = user!.id
        const res = await AccountService.monoTransactions(params.accountId, query)
        if (!res.ok) {
            const { message } = await res.json() as MonoResponse
            logger.error({ message }, `transactions:: Failed to fetch transactions for user ${userId}`)
            set.status = 500
            await AuditService.queue.add("log", {
                ...audit,
                status: "failure",
                details: {
                    reason: message
                }
            })
            logger.info("transactions:: audit log queued")
            return {
                type: "error" as const,
                error: {
                    message: "Internal Server Error",
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    details: []
                }
            }
        }
        const { data: transactions } = await res.json() as MonoResponse<MonoAccountTransactionsResponseData>
        await AccountService.queue.add("cache-transactions", {
            userId,
            transactions
        })
        await AuditService.queue.add("log", audit)
        logger.info("transactions:: audit log queued")
        return {
            type: "success" as const,
            data: { transactions }
        }
    }, {
        detail: {
            tags: ["Individual User", "Account"],
            description: "List accounts transactions",
            summary: "List transactions"
        },
        params: "transactionsParams",
        query: "transactionsQuery",
        user: ["individual"],
        response: {
            200: "transactionsSuccess",
            401: "error",
            500: "error"
        },
        async beforeHandle({ logger, user, set, audit, params }) {
            if (!user) {
                logger.error("list:: User not found")
                set.status = 401
                await AuditService.queue.add("log", {
                    ...audit,
                    status: "failure",
                    details: {
                        reason: "Unauthorized"
                    }
                })
                logger.info("transactions:: audit log queued")
                return {
                    type: "error" as const,
                    error: {
                        message: "Unauthorized",
                        code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                        details: []
                    }
                }
            }
            audit.userId = user.id
            audit.targetId = params.accountId
            const cacheKey = getCacheKey(CACHE_GET.mono.transactions.key, user.id)
            const cachedTransactions = await cache.get(cacheKey)
            if (cachedTransactions) {
                logger.info(`list:: Cached transactions found for user ${user.id}`)
                set.headers[CACHE_GET.mono.transactions.header] = CACHE_GET_HEADER_VALUE.Hit
                set.headers[CACHE_GET.mono.transactions.ttlHeader] = CACHE_GET.mono.transactions.ttl
                await AuditService.queue.add("log", audit)
                logger.info("transactions:: audit log queued")
                return {
                    type: "success" as const,
                    data: {
                        transactions: JSON
                            .parse(decrypt(Buffer.from(cachedTransactions)).toString())
                    }
                }
            }
        }
    })