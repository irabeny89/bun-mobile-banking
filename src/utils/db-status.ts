export default async function dbStatuses(db: Bun.SQL, cache: Bun.RedisClient) {
    const dbStatus = await db`SELECT 1`
        .then(() => "✅ connected")
        .catch(() => "❌ disconnected")
    const cacheStatus = await cache.connect()
        .then(() => "✅ connected")
        .catch(() => "❌ disconnected")
    const storageStatus = await Bun.$`bun garage:status`.text()
        .then(() => "✅ connected")
        .catch(() => "❌ disconnected")
    return { dbStatus, cacheStatus, storageStatus }
}
