import Elysia from "elysia";
import pkg from "../../package.json";
import { IS_PROD_ENV } from "../config";
import dbSingleton from "@/utils/db";
import cacheSingleton from "@/utils/cache";

/**
 * System status plugin
 * Logs system status on server start
 */
export const systemStatus = new Elysia({ name: "system-status" })
    .onStart(async ({ server }) => {
        const db = dbSingleton();
        const dbStatus = await db`SELECT 1`
            .then(() => "✅ connected")
            .catch(() => "❌ disconnected")
        const cache = cacheSingleton();
        const cacheStatus = await cache.connect()
            .then(() => "✅ connected")
            .catch(() => "❌ disconnected")

        console.log(`🦊 ${pkg.name} v${pkg.version} server running 🚀`);
        console.log(`🛠️  Environment: ${IS_PROD_ENV ? "production" : "development"}`);
        console.log(`💾 Database status: ${dbStatus}`)
        console.log(`📀 Cache status: ${cacheStatus}`)
        console.log(`⚙️  Server: ${server?.url}`);
        console.log(`📚 API Docs: ${server?.url}openapi`);
    })
