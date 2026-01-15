import { userMacro } from "@/plugins/user-macro.plugin";
import pinoLogger from "@/utils/pino-logger";
import Elysia from "elysia";
import { AccountModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AccountService } from "../service";
import { MONO } from "@/config";
import { KycService } from "@/modules/kyc/service";
import { MonoResponse, MonoConnectAuthAccountLinkingResponseData } from "@/types/mono.type";
import { generateRef } from "@/utils/ref-gen";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";


export const connect = new Elysia({ name: "connect" })
    .use(userMacro)
    .model({
        connectSuccess: AccountModel.connectSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store, server, request, headers }) => {
        const logger = pinoLogger(store)
        return {
            logger,
            audit: {
                action: "account_linking_init",
                userId: "unknown",
                userType: "individual",
                targetId: "unknown",
                targetType: "account",
                status: "success",
                details: {},
                ipAddress: server?.requestIP(request)?.address || "unknown",
                userAgent: headers["user-agent"] || "unknown",
            } satisfies AuditModel.CreateAuditT
        }
    })
    .get("/connect", async ({ user, logger, set, audit }) => {
        if (!user) {
            logger.error("connect:: User not found")
            set.status = 401
            await AuditService.queue.add("log", {
                ...audit,
                status: "failure",
                details: { reason: "User not found" }
            });
            logger.info("connect:: audit log queued")
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
        const data = await KycService.getTier1Data(user.id)
        if (!data) {
            logger.error("connect:: Failed to get KYC tier 1 data")
            set.status = 500
            await AuditService.queue.add("log", {
                ...audit,
                status: "failure",
                details: { reason: "Failed to get KYC tier 1 data" }
            });
            logger.info("connect:: audit log queued")
            return {
                type: "error" as const,
                error: {
                    message: "Failed to connect to your account",
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    details: []
                }
            }
        }
        const res = await AccountService.monoInitiateAccountLinking({
            customer: {
                name: `${data.firstName} ${data.lastName}`,
                email: user.email
            },
            meta: {
                ref: generateRef(MONO.accountRefPrefix)
            },
            scope: "auth",
            redirect_url: "/"
        })
        if (!res.ok) {
            logger.error("connect:: Failed to initiate account linking")
            set.status = 500
            await AuditService.queue.add("log", {
                ...audit,
                status: "failure",
                details: { reason: "Failed to initiate account linking" }
            });
            logger.info("connect:: audit log queued")
            return {
                type: "error" as const,
                error: {
                    message: "Failed to connect to your account",
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    details: []
                }
            }
        }
        const { data: { mono_url } } = await res.json() as MonoResponse<MonoConnectAuthAccountLinkingResponseData>
        await AuditService.queue.add("log", {
            ...audit,
            details: { name: `${data.firstName} ${data.lastName}`, email: user.email }
        });
        logger.info("connect:: audit log queued")
        return {
            type: "success" as const,
            data: {
                message: "Click the link to connect your account",
                connectUrl: mono_url
            }
        }
    }, {
        user: ["individual"],
        detail: {
            tags: ["Account", "Individual User"],
            description: "Connect to your bank account",
            summary: "Link bank account"
        },
        response: {
            200: "connectSuccess",
            401: "error",
            500: "error"
        }
    })