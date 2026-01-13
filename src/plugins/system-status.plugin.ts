import Elysia from "elysia";
import pkg from "../../package.json";
import { NODE_ENV } from "../config";
import dbSingleton from "@/utils/db";
import dbStatuses from "@/utils/db-status";
import cacheSingleton from "@/utils/cache";

/**
 * System status plugin
 * Logs system status on server start
 */
export const systemStatus = new Elysia({ name: "system-status" })
    .onStart(async ({ server }) => {
        const db = dbSingleton()
        const cache = cacheSingleton()
        const { dbStatus, cacheStatus, storageStatus } = await dbStatuses(db, cache)
        console.log(`🦊 ${pkg.name} v${pkg.version} server running 🚀`);
        console.log(`🛠️  Environment: ${NODE_ENV}`);
        console.log(`💾 Database status: ${dbStatus}`)
        console.log(`📀 Cache status: ${cacheStatus}`)
        console.log(`🗃️  Storage status: ${storageStatus}`)
        console.log(`⚙️  Server: ${server?.url}`);
        console.log(`📚 API Docs: ${server?.url}openapi`);
    })
