import Elysia from "elysia";
import { userMacro } from "@/plugins/user-macro.plugin";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import pinoLogger from "@/utils/pino-logger";
import { AccountModel } from "../model";
import { AccountService } from "../service";
import { MonoAccountStatementResponseData, MonoResponse } from "@/types/mono.type";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

export const statement = new Elysia({ name: "statement" })
    .use(userMacro)
    .model({
        statementParams: AccountModel.statementParamsSchema,
        statementQuery: AccountModel.statementQuerySchema,
        statementSuccess: AccountModel.statementSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .state("audit", {
        action: "statement_generation",
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
    .get("/:accountId/statement", async ({ logger, set, query, params, user, store }) => {
        const res = query.action.type === "generate"
            ? await AccountService.monoStatement(params.accountId, {
                period: query.action.period,
                output: "pdf"
            })
            : await AccountService.monoStatementPollPdfStatus(params.accountId, query.action.jobId)
        if (!res.ok) {
            const error = await res.json() as MonoResponse
            logger.error({ error }, "statement:: Mono statement error")
            set.status = 500
            // only log failure for generation, status polling is noisy
            query.action.type === "generate" && await AuditService.queue.add("log", {
                ...store.audit,
                status: "failure",
                details: {
                    ...store.audit.details,
                    reason: error.message,
                }
            });

            return {
                type: "error" as const,
                error: {
                    message: "Internal Server Error",
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    details: []
                }
            }
        }
        const { data } = await res.json() as MonoResponse<MonoAccountStatementResponseData>
        await AccountService.queue.add("update-statement", {
            id: data.id,
            path: data.path,
            status: data.status,
            accountId: params.accountId,
            userId: user!.id
        })
        // only log success for generation, status polling is noisy
        query.action.type === "generate" && await AuditService.queue.add("log", {
            ...store.audit,
            details: {
                ...store.audit.details,
                statement: data
            }
        });

        return {
            type: "success" as const,
            data
        }
    }, {
        detail: {
            tags: ["Individual User", "Account"],
            description: "Get account statement",
            summary: "Get statement"
        },
        params: "statementParams",
        query: "statementQuery",
        user: ["individual"],
        response: {
            200: "statementSuccess",
            401: "error",
            500: "error"
        },
        async beforeHandle({ logger, user, set, store, params, query }) {
            if (!user) {
                logger.error("statement:: User not found")
                set.status = 401
                // only log failure for generation, status polling is noisy
                query.action.type === "generate" && await AuditService.queue.add("log", {
                    ...store.audit,
                    status: "failure",
                    details: { reason: "User not found" }
                });
                logger.info("statement:: audit log queued")
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
            store.audit.targetId = params.accountId
            store.audit.details = { ...query, accountId: params.accountId }
        }
    })