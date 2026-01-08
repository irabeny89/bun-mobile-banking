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

export const connect = new Elysia({ name: "connect" })
    .use(userMacro)
    .model({
        connectSuccess: AccountModel.connectSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store }) => {
        const logger = pinoLogger(store)
        return {
            logger
        }
    })
    .get("/connect", async ({ user, logger, set }) => {
        if (!user) {
            logger.error("connect:: User not found")
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
        const data = await KycService.getTier1Data(user.id)
        if (!data) {
            logger.error("connect:: Failed to get tier 1 data")
            set.status = 500
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
            return {
                type: "error" as const,
                error: {
                    message: "Failed to connect to your account",
                    code: ERROR_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                    details: []
                }
            }
        }
        const { data: { mono_url, is_multi, meta } } = await res.json() as MonoResponse<MonoConnectAuthAccountLinkingResponseData>
        await AccountService.queue.add("update-mfa", {
            userId: user.id,
            mfa: is_multi,
            reference: meta.ref
        })
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