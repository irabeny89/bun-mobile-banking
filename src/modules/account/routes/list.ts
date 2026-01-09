import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AccountService } from "../service";

export const list = new Elysia({ name: "list-accounts" })
    .use(userMacro)
    .model({
        accountListSuccess: AccountModel.accountListSuccessSchema,
        accountListQuery: AccountModel.accountListQuerySchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => ({
        logger: pinoLogger(store)
    }))
    .get("/", async ({ query, user, logger, set }) => {
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
        const accounts = await AccountService.findAll(user.id, query)
        return {
            type: "success" as const,
            data: { accounts },
            pagination: {
                cursor: accounts[accounts.length - 1]?.created_at || "",
                hasMore: accounts.length === query.limit
            }
        }
    }, {
        detail: {
            tags: ["Individual User", "Account"],
            description: "List linked accounts",
            summary: "List accounts"
        },
        user: ["individual"],
        query: "accountListQuery",
        response: {
            200: "accountListSuccess",
            500: "error"
        }
    })