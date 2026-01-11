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

export const list = new Elysia({ name: "list-accounts" })
    .use(userMacro)
    .model({
        accountListSuccess: AccountModel.accountListSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({
        logger: pinoLogger(store), cache: cacheSingleton()
    }))
    .get("/", async ({ user, logger, set }) => {
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
            for (const [index, res] of responses.entries()) {
                if (!res.ok) {
                    const { message } = await res.json()
                    logger.error(`list:: Mono account details failed for account ${dbAccounts[index].monoAccountId} with message - ${message}`)
                    set.status = 500
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
            set.headers[CACHE_GET.monoAccounts.header] = CACHE_GET_HEADER_VALUE.Set
            set.headers[CACHE_GET.monoAccounts.ttlHeader] = CACHE_GET.monoAccounts.ttl
            await AccountService.queue.add("cache-accounts", { 
                userId: user!.id, accounts
            })
        }
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
        async beforeHandle({ cache, logger, user, set }) {
            if (!user) {
                logger.error("list:: User not found")
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
            const cacheKey = getCacheKey(CACHE_GET.monoAccounts.key, user.id)
            const cachedAccounts = await cache.get(cacheKey)
            if (cachedAccounts) {
                logger.info(`list:: Cached accounts found for user ${user.id}`)
                set.headers[CACHE_GET.monoAccounts.header] = CACHE_GET_HEADER_VALUE.Hit
                set.headers[CACHE_GET.monoAccounts.ttlHeader] = CACHE_GET.monoAccounts.ttl
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