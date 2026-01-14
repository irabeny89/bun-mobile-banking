import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { CACHE_GET_HEADER_VALUE, ERROR_RESPONSE_CODES } from "@/types";
import { AccountService } from "../service";
import { MonoAccountDetailsResponseData, MonoResponse } from "@/types/mono.type";
import cacheSingleton, { getCacheKey } from "@/utils/cache";
import { CACHE_GET } from "@/config";
import { decrypt } from "@/utils/encryption";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

const cache = cacheSingleton()
export const list = new Elysia({ name: "list-accounts" })
    .use(userMacro)
    .model({
        accountListSuccess: AccountModel.accountListSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store, server, request, headers }) => ({
        logger: pinoLogger(store),
        audit: {
            action: "list_linked_accounts",
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
    .get("/", async ({ user, logger, set, audit }) => {
        const dbAccounts = await AccountService.findAll(user!.id)
        let accounts: Array<
            Record<"accountNumber", string> &
            Omit<AccountModel.MonoAccountT, "account_number">
        > = []
        if (dbAccounts.length) {
            const responses = await Promise.all(
                dbAccounts.map(({ monoAccountId }) => AccountService
                    .monoAccountDetails(monoAccountId))
            )
            // * for every account id update with details from mono
            for (const [index, res] of responses.entries()) {
                if (!res.ok) {
                    const { message } = await res.json()
                    logger.error(`list:: Mono account details failed for account ${dbAccounts[index].monoAccountId} with message - ${message}`)
                    set.status = 500
                    await AuditService.queue.add("log", {
                        ...audit,
                        status: "failure",
                        details: {
                            reason: "Internal Server Error"
                        }
                    })
                    logger.info("list:: audit log queued")
                    return {
                        type: "error" as const,
                        error: {
                            message: "Internal Server Error",
                            code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                            details: []
                        }
                    }
                }
                const { data: { account: { account_number, ...rest } } } = await res
                    .json() as MonoResponse<MonoAccountDetailsResponseData>
                accounts.push({
                    ...rest,
                    accountNumber: account_number
                })
            }
            set.headers[CACHE_GET.mono.accounts.header] = CACHE_GET_HEADER_VALUE.Set
            set.headers[CACHE_GET.mono.accounts.ttlHeader] = CACHE_GET.mono.accounts.ttl
            await AccountService.queue.add("cache-accounts", {
                userId: user!.id, accounts
            })
        }
        await AuditService.queue.add("log", audit)
        logger.info("list:: audit log queued")
        return {
            type: "success" as const,
            data: { accounts },
        }
    }, {
        detail: {
            tags: ["Individual User", "Account"],
            description: "List linked accounts",
            summary: "List accounts"
        },
        user: ["individual"],
        response: {
            200: "accountListSuccess",
            401: "error",
            500: "error"
        },
        async beforeHandle({ logger, user, set, audit }) {
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
                logger.info("list:: audit log queued")
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
            const cacheKey = getCacheKey(CACHE_GET.mono.accounts.key, user.id)
            const cachedAccounts = await cache.get(cacheKey)
            if (cachedAccounts) {
                logger.info(`list:: Cached accounts found for user ${user.id}`)
                set.headers[CACHE_GET.mono.accounts.header] = CACHE_GET_HEADER_VALUE.Hit
                set.headers[CACHE_GET.mono.accounts.ttlHeader] = CACHE_GET.mono.accounts.ttl
                await AuditService.queue.add("log", audit)
                logger.info("list:: audit log queued")
                return {
                    type: "success" as const,
                    data: {
                        accounts: JSON
                            .parse(decrypt(Buffer.from(cachedAccounts)).toString())
                    }
                }
            }
        }
    })