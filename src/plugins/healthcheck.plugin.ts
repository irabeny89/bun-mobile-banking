import cacheSingleton from "@/utils/cache";
import dbSingleton from "@/utils/db";
import dbStatuses from "@/utils/db-status";
import Elysia from "elysia";
import { t } from "elysia";

export const healthcheck = new Elysia({ name: "healthcheck", detail: { description: "Healthcheck endpoint" } })
    .model("healthcheck", t.Object({
        serverStatus: t.String(),
        dbStatus: t.String(),
        cacheStatus: t.String(),
        storageStatus: t.Optional(t.String())
    }))
    .get("/healthcheck", async () => {
        const db = dbSingleton()
        const cache = cacheSingleton()
        const { storageStatus, ...rest } = await dbStatuses(db, cache)
        const statuses = { serverStatus: "✅ online", ...rest }
        return storageStatus ? { ...statuses, storageStatus } : statuses
    }, {
        response: "healthcheck",
        tags: ["Server"],
    })
