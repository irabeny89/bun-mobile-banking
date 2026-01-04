import cacheSingleton from "@/utils/cache";
import dbSingleton from "@/utils/db";
import dbStatuses from "@/utils/db-status";
import Elysia from "elysia";
import { t } from "elysia";

export const healthcheck = new Elysia({ name: "healthcheck", detail: { description: "Healthcheck endpoint" } })
    .model("healthcheck", t.Object({
        serverStatus: t.String(),
        dbStatus: t.String(),
        cacheStatus: t.String()
    }))
    .get("/healthcheck", async () => {
        const db = dbSingleton()
        const cache = cacheSingleton()
        const { dbStatus, cacheStatus } = await dbStatuses(db, cache)
        return { serverStatus: "✅ online", dbStatus, cacheStatus }
    }, {
        response: "healthcheck",
        tags: ["Server"],
    })
    