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
    .resolve(({ store, server, request, headers }) => ({
        logger: pinoLogger(store),
        audit: {
            action: "statement_generation",
            userId: "unknown",
            userType: "individual",
            targetId: "unknown",
            targetType: "account",
            status: "success",
            details: {},
            ipAddress: server?.requestIP(request)?.address || "unknown",
            userAgent: headers["user-agent"] || "unknown",
        } as AuditModel.CreateAuditT
    }))
    .get("/:accountId/statement", async ({ logger, set, query, params, user, audit }) => {
        // Update known user details in audit object
        if (user) {
            audit.userId = user.id;
        }
        audit.targetId = params.accountId;
        const res = query.action.type === "generate"
            ? await AccountService.monoStatement(params.accountId, {
                period: query.action.period,
                output: "pdf"
            })
            : await AccountService.monoStatementPollPdfStatus(params.accountId, query.action.jobId)
        if (!res.ok) {
            const error = await res.json()
            logger.error({ error }, "statement:: Mono statement error")
            set.status = 500

            await AuditService.queue.add("log", {
                ...audit,
                status: "failure",
                details: {
                    error,
                    accountId: params.accountId,
                    actionType: query.action.type
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

        await AuditService.queue.add("log", {
            ...audit,
            // only log success for generation, status polling is noisy
            status: query.action.type === "generate" ? "success" : "success",
            details: {
                statementId: data.id,
                path: data.path,
                accountId: params.accountId,
                actionType: query.action.type
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
        async beforeHandle({ logger, user, set }) {
            if (!user) {
                logger.error("statement:: User not found")
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
        }
    })