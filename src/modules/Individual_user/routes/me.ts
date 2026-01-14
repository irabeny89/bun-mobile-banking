import Elysia from "elysia";
import { IndividualUserModel } from "../model";
import { CommonSchema } from "@/share/schema";
import pinoLogger from "@/utils/pino-logger";
import { userMacro } from "@/plugins/user-macro.plugin";
import { ERROR_RESPONSE_CODES } from "@/types";
import { AuditModel } from "@/modules/audit/model";
import { AuditService } from "@/modules/audit/service";

export const me = new Elysia({ name: "me-individual" })
    .use(userMacro)
    .model({
        me: IndividualUserModel.getMeSchema,
        meSuccess: IndividualUserModel.getMeSuccessSchema,
        error: CommonSchema.errorSchema,
    })
    .resolve(({ store, server, request, headers }) => {
        return {
            logger: pinoLogger(store),
            audit: {
                action: "me",
                userId: "unknown",
                userType: "individual",
                targetId: "unknown",
                targetType: "individual_user",
                status: "success",
                details: {},
                ipAddress: server?.requestIP(request)?.address || "unknown",
                userAgent: headers["user-agent"] || "unknown",
            } satisfies AuditModel.CreateAuditT
        }
    })
    .get("/me", async ({ logger, set, user, audit }) => {
        if (!user) {
            logger.info("me:: user not found")
            set.status = 401
            await AuditService.queue.add("log", {
                ...audit,
                status: "failure",
                details: { reason: "User not found" }
            });
            logger.info("me:: audit log queued")
            return {
                type: "error" as const,
                error: {
                    message: "Register or login to continue",
                    code: ERROR_RESPONSE_CODES.UNAUTHORIZED,
                    details: []
                }
            }
        }
        logger.info("me:: user found, returning data")
        await AuditService.queue.add("log", {
            ...audit,
            userId: user.id,
            details: { reason: "User found" }
        });
        logger.info("me:: audit log queued")
        return { type: "success", data: user }
    }, {
        detail: {
            tags: ["Individual User"],
            description: "Get authorized individual user data.",
            summary: "Get individual user"
        },
        response: {
            200: "meSuccess",
            401: "error",
        },
        user: ["individual"]
    })