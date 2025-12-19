import dbSingleton from "@/utils/db";
import { KycModel } from "./model";

const sql = dbSingleton();
export class KycService {
    static async getTier1Status(userId: string) {
        const kyc: Pick<KycModel.DbDataT, "currentTier" | "tier1Status">[] = await sql`
            SELECT current_tier as "currentTier", tier1_status as "tier1Status"
            FROM kyc
            WHERE user_id = ${userId}
        `
        return kyc[0] ? {
            currentTier: kyc[0].currentTier,
            tier1Status: kyc[0].tier1Status,
        } : null;
    }
}