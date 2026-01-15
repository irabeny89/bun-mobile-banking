import Elysia from "elysia";
import { IndividualUserModel } from "../model";
import { CommonSchema } from "@/share/schema";
import { userMacro } from "@/plugins/user-macro.plugin";
import pinoLogger from "@/utils/pino-logger";
import { IndividualUserService } from "../service";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

export const mfa = new Elysia({ name: "mfa-individual" })
    .model({
        mfa: IndividualUserModel.postMfaSchema,
        mfaSuccess: IndividualUserModel.postMfaSuccessSchema,
        error: CommonSchema.errorSchema
    })
    .use(userMacro)
    .resolve(({ store, server, request, headers }) => {
        return {
            logger: pinoLogger(store),
            audit: {
                action: "toggle_mfa",
                userId: "unknown",
                userType: "individual",
                targetId: "unknown",
                targetType: "individual_user",
                status: "success",
                details: {},
                ipAddress: server?.requestIP(request)?.address || "unknown",
                userAgent: headers["user-agent"] || "unknown",
            } as AuditModel.CreateAuditT
        }
    })
    .post("/mfa", async ({ logger, user, body, set, audit }) => {
        if (!user) {
            set.status = 401
            await AuditService.queue.add("log", {
                ...audit,
                status: "failure",
                details: { reason: "User not found" }
            });
            logger.info("mfa:: audit log queued")
            return {
                type: "error",
                error: {
                    details: [],
                    message: "Register or login to continue",
                    code: ERROR_RESPONSE_CODES.UNAUTHORIZED
                }
            }
        }
        logger.info(`mfa:: ${body.mfaEnabled ? "enabling" : "disabling"} MFA`);
        await IndividualUserService.setMfa(user.id, body.mfaEnabled);
        await AuditService.queue.add("log", {
            ...audit,
            userId: user.id,
            details: { mfaEnabled: body.mfaEnabled }
        });
        logger.info("mfa:: audit log queued")
        return {
            type: "success",
            data: { mfaEnabled: body.mfaEnabled }
        }
    }, {
        detail: {
            tags: ["Individual User"],
            description: "Enable/disable MFA for the user",
            summary: "MFA toggle"
        },
        body: "mfa",
        response: {
            200: "mfaSuccess",
            401: "error"
        },
        user: ["individual"]
    })
