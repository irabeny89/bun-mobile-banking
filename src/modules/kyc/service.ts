import dbSingleton from "@/utils/db";
import { KycModel } from "./model";
import { DOJAH, IS_PROD_ENV } from "@/config";
import { DojahBvnValidateArgs, DojahNinLookupArgs, DojahVinLookupArgs } from "@/types";
import { encrypt } from "@/utils/encryption";

const headers = new Headers();
headers.set("Content-Type", "application/json");
headers.set("AppId", DOJAH.appId);
headers.set("Authorization", `Bearer ${DOJAH.secret}`);

const baseUrl = IS_PROD_ENV ? DOJAH.url : DOJAH.sandbox.url;

const sql = dbSingleton();
export class KycService {
    static dojahVerifyWebhook(requestIp: string) {
        return requestIp === DOJAH.ip
    }
    static async dojahLookupNin({ nin }: DojahNinLookupArgs) {
        const url = new URL(baseUrl + "/api/v1/kyc/nin");
        url.searchParams.set("nin", nin);
        return await fetch(url, { headers });
    }
    static async dojahValidateBvn(data: DojahBvnValidateArgs) {
        const url = new URL(baseUrl + "/api/v1/kyc/bvn");
        url.searchParams.set("bvn", data.bvn);
        url.searchParams.set("first_name", data.firstName);
        url.searchParams.set("last_name", data.lastName);
        return await fetch(url, { headers });
    }
    static async dojahLookupVin({ vin }: DojahVinLookupArgs) {
        const url = new URL(baseUrl + "/api/v1/kyc/vin");
        url.searchParams.set("vin", vin);
        return await fetch(url, { headers });
    }
    static async createKyc(userId: string, data: KycModel.PostTier1BodyT) {
        const tier1Data = encrypt(JSON.stringify(data));
        await sql`
            INSERT INTO kyc (user_id, tier1_data, tier1_status)
            VALUES (${userId}, ${tier1Data}, 'success')
        `
    }
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
    static async getTier2Status(userId: string) {
        const kyc: Pick<KycModel.DbDataT, "currentTier" | "tier2Status">[] = await sql`
            SELECT current_tier as "currentTier", tier2_status as "tier2Status"
            FROM kyc
            WHERE user_id = ${userId}
        `
        return kyc[0] ? {
            currentTier: kyc[0].currentTier,
            tier2Status: kyc[0].tier2Status,
        } : null;
    }
    static async getTier3Status(userId: string) {
        const kyc: Pick<KycModel.DbDataT, "currentTier" | "tier3Status">[] = await sql`
            SELECT current_tier as "currentTier", tier3_status as "tier3Status"
            FROM kyc
            WHERE user_id = ${userId}
        `
        return kyc[0] ? {
            currentTier: kyc[0].currentTier,
            tier3Status: kyc[0].tier3Status,
        } : null;
    }
    static async updateTier2Status(userId: string, data: KycModel.PostTier2BodyT) {
        const tier2Data = encrypt(JSON.stringify(data));
        await sql`
            UPDATE kyc
            SET 
                tier2_data = ${tier2Data}, 
                tier2_status = 'success',
                current_tier = 'tier_2'
            WHERE user_id = ${userId}
        `
    }
    static async updateTier3Status(userId: string, data: KycModel.PostTier3BodyT) {
        const tier3Data = encrypt(JSON.stringify(data));
        await sql`
            UPDATE kyc
            SET 
                tier3_data = ${tier3Data}, 
                tier3_status = 'success',
                current_tier = 'tier_3'
            WHERE user_id = ${userId}
        `
    }
}