import dbSingleton from "@/utils/db";
import { KycModel } from "./model";
import { DOJAH, IS_PROD_ENV, MONO, STORAGE } from "@/config";
import { DojahBvnValidateArgs, DojahLiveSelfieVerifyArgs, DojahLiveSelfieVerifyResponse, DojahNinLookupArgs, DojahUtilityBillVerifyArgs, DojahUtilityBillVerifyResponse, DojahVinLookupArgs, MonoLookupNinArgs, MonoLookupNinResponse } from "@/types";
import { decrypt, encrypt } from "@/utils/encryption";
import { fileStore, getUploadLocation } from "@/utils/storage";
import { CommonSchema } from "@/share/schema";

const sql = dbSingleton();
export class KycService {
    static async monoLookupNin({ nin }: MonoLookupNinArgs) {
        return fetch(MONO.baseUrl + MONO.lookupPath, {
            headers: MONO.headers,
            method: "POST",
            body: JSON.stringify({ nin })
        });
    }
    /**
     * Uploads address proof file to storage and returns url to access it.
     * @param file address proof file
     * @param userId user id
     * @param userType user type
     * @returns uploaded file url
     */
    // static async uploadAddressProof(file: File, userId: string, userType: CommonSchema.UserType) {
    //     const { path, url } = getUploadLocation(STORAGE.addressProofPath, file, userType, userId)
    //     await fileStore
    //         .file(path)
    //         .write(encrypt(Buffer.from(await file.arrayBuffer())))
    //     return url
    // }
    static dojahVerifyWebhook(requestIp: string) {
        return requestIp === DOJAH.webhookIp
    }
    static dojahLookupNin({ nin }: DojahNinLookupArgs) {
        const url = new URL(IS_PROD_ENV ? DOJAH.url : DOJAH.url + DOJAH.ninPath);
        url.searchParams.set("nin", nin);
        return fetch(url, { headers: DOJAH.headers });
    }
    static dojahValidateBvn(data: DojahBvnValidateArgs) {
        const url = new URL(IS_PROD_ENV ? DOJAH.url : DOJAH.url + DOJAH.bvnPath);
        url.searchParams.set("bvn", data.bvn);
        url.searchParams.set("first_name", data.firstName);
        url.searchParams.set("last_name", data.lastName);
        return fetch(url, { headers: DOJAH.headers });
    }
    static dojahLookupVin({ vin }: DojahVinLookupArgs) {
        const url = new URL(IS_PROD_ENV ? DOJAH.url : DOJAH.url + DOJAH.vinPath);
        url.searchParams.set("vin", vin);
        return fetch(url, { headers: DOJAH.headers });
    }
    static dojahVerifyUtilityBill(data: DojahUtilityBillVerifyArgs) {
        const url = new URL(IS_PROD_ENV ? DOJAH.url : DOJAH.url + DOJAH.utilityBillPath);
        return fetch(url, {
            headers: DOJAH.headers,
            method: "POST",
            body: JSON.stringify(data)
        });
    }
    /**
     * Use Dojah liveness check api to verify a base64 encoded image.
     * @param data image in data should be base64
     * @returns response
     */
    static dojahVerifySelfie(data: DojahLiveSelfieVerifyArgs) {
        const url = new URL(IS_PROD_ENV ? DOJAH.url : DOJAH.url + DOJAH.livenessPath);
        return fetch(url, {
            headers: DOJAH.headers,
            method: "POST",
            body: JSON.stringify(data)
        });
    }
    static async livenessCheck(liveSelfie: File) {
        const livenessErrMsg = "Verification failed - Liveness check failed"
        const res = await KycService.dojahVerifySelfie({
            image: Buffer.from(await liveSelfie.arrayBuffer()).toString("base64")
        })
        if (!res.ok) throw new Error(livenessErrMsg, { cause: await res.json() })
        const { entity: { liveness } } = await res.json() as DojahLiveSelfieVerifyResponse
        if (!liveness.liveness_check || liveness.liveness_probability < 0.5) {
            throw new Error(livenessErrMsg)
        }
    }
    static async verifyUtilityBill(addressProofFile: File, userId: string, userType: CommonSchema.UserType) {
        const dojahErrMsg = "Service temporarily unavailable";
        const tierDataErrMsg = "Verification failed - Tier 1 data not found";
        const streetErrMsg = "Verification failed - Street name mismatch";
        const cityErrMsg = "Verification failed - City name mismatch";
        const stateErrMsg = "Verification failed - State name mismatch";
        const { path } = getUploadLocation(
            STORAGE.utilityBillPath,
            userType,
            userId,
            addressProofFile.type.split("/").pop() as string
        )
        // N.B - remember to delete this file and only store encrypted kyc data
        // cannot encrypt because Dojah requires the file url of unencrypted data
        await fileStore.file(path).write(addressProofFile)
        // verify with presigned file url with short expiration
        const response = await this.dojahVerifyUtilityBill({
            input_type: "url",
            input_value: fileStore.presign(path, { expiresIn: 60 })
        })
        if (!response.ok) throw new Error(dojahErrMsg, { cause: await response.json() })
        const {
            entity: { address_info, metadata, result }
        } = await response.json() as DojahUtilityBillVerifyResponse;
        if (result.status !== "success" || !metadata.is_recent) throw new Error(dojahErrMsg)
        const tier1Data = await this.getTier1Data(userId)
        if (!tier1Data) throw new Error(tierDataErrMsg)
        if (tier1Data.street !== address_info.street) throw new Error(streetErrMsg)
        if (tier1Data.city !== address_info.city) throw new Error(cityErrMsg)
        if (tier1Data.state !== address_info.state) throw new Error(stateErrMsg)
    }
    static async verifyTier1Nin(userId: string, body: KycModel.PostTier1BodyT) {
        const tier1StatusErrMsg = "Verification failed - Tier 1 status already verified"
        const ninLookupErrMsg = "Verification failed - NIN lookup failed"
        const nameMismatchErrMsg = "Verification failed - Name mismatch"
        const dobMismatchErrMsg = "Verification failed - Date of birth mismatch"

        const tier1Status = await this.getTier1Status(userId)
        if (tier1Status) throw new Error(tier1StatusErrMsg)
        const res = await this.monoLookupNin({ nin: body.nin })
        if (!res.ok) throw new Error(ninLookupErrMsg, { cause: await res.json() })
        const { data: lookup } = await res.json() as MonoLookupNinResponse
        if (lookup.firstname !== body.firstName || lookup.surname !== body.lastName) {
            throw new Error(nameMismatchErrMsg)
        }
        const date = new Intl.DateTimeFormat()
        const formattedLookupDate = date.format(new Date(lookup.birthdate))
        const formattedBodyDate = date.format(body.dob)
        if (formattedBodyDate !== formattedLookupDate) throw new Error(dobMismatchErrMsg)
    }
    /**
     * Create a new kyc record in the database with encrypted tier 1 data.
     * @param userId user id
     * @param data tier 1 data
     */
    static async createKyc(userId: string, data: KycModel.PostTier1BodyT) {
        const tier1Data = encrypt(Buffer.from(JSON.stringify(data)));
        await sql`
            INSERT INTO kyc (user_id, tier1_data, tier1_status)
            VALUES (${userId}, ${tier1Data}, 'success')
        `
    }
    /**
     * Get the tier 1 status of a user.
     * @param userId user id
     * @returns tier 1 status
     */
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
    static async updateTier2(userId: string, data: KycModel.PostTier2BodyT) {
        // get upload location for encrypted id image
        const { path, url } = getUploadLocation(STORAGE.govtIdPath, "individual", userId, "enc")
        // encrypt and upload id image to storage
        await fileStore
            .file(path)
            .write(encrypt(Buffer.from(await data.idImage.arrayBuffer())))
        // encrypt and store tier 2 data with url of encrypted id image
        const tier2Data = encrypt(Buffer.from(JSON.stringify({
            ...data,
            idImage: url
        })));
        // update tier 2 data in database
        await sql`
            UPDATE kyc
            SET 
                tier2_data = ${tier2Data}, 
                tier2_status = 'success',
                current_tier = 'tier_2'
            WHERE user_id = ${userId}
        `
    }
    static async updateTier3(userId: string, data: KycModel.PostTier3BodyT) {
        // get upload location for encrypted address proof
        const addressProofUploadLocation = getUploadLocation(STORAGE.addressProofPath, "individual", userId, "enc")
        const selfieUploadLocation = getUploadLocation(STORAGE.liveSelfiePath, "individual", userId, "enc")
        // encrypt and upload address proof to storage
        await fileStore
            .file(addressProofUploadLocation.path)
            .write(encrypt(Buffer.from(await data.addressProof.arrayBuffer())))
        // encrypt and upload selfie to storage
        await fileStore
            .file(selfieUploadLocation.path)
            .write(encrypt(Buffer.from(await data.liveSelfie.arrayBuffer())))
        // encrypt and store tier 3 data with url of encrypted address proof
        const tier3Data = encrypt(Buffer.from(JSON.stringify({
            ...data,
            addressProof: addressProofUploadLocation.url,
            liveSelfie: selfieUploadLocation.url
        })));
        // update tier 3 data in database
        await sql`
            UPDATE kyc
            SET 
                tier3_data = ${tier3Data}, 
                tier3_status = 'success',
                current_tier = 'tier_3'
            WHERE user_id = ${userId}
        `
    }
    /**
     * Get encrypted tier 1 data from the db and return a decrypted object.
     * @param userId user id
     * @returns decrypted json object
     */
    static async getTier1Data(userId: string): Promise<
        Omit<KycModel.PostTier1BodyT, "passportPhoto">
        & Record<"passportPhoto", string>
        | null
    > {
        const kyc: { tier1Data: string }[] = await sql`
            SELECT tier1_data as "tier1Data"
            FROM kyc
            WHERE user_id = ${userId}
        `
        if (kyc.length === 0 || !kyc[0].tier1Data) return null;
        const dataBuf = decrypt(Buffer.from(kyc[0].tier1Data));
        return JSON.parse(dataBuf.toString("utf8"));
    }
    /**
     * Get encrypted tier 2 data from the db and return a decrypted object.
     * @param userId user id
     * @returns decrypted json object
     */
    static async getTier2Data(userId: string): Promise<
        Omit<KycModel.PostTier2BodyT, "idImage">
        & Record<"idImage", string>
        | null
    > {
        const kyc: { tier2Data: string }[] = await sql`
            SELECT tier2_data as "tier2Data"
            FROM kyc
            WHERE user_id = ${userId}
        `
        if (kyc.length === 0 || !kyc[0].tier2Data) return null;
        const dataBuf = decrypt(Buffer.from(kyc[0].tier2Data, "base64"));
        return JSON.parse(dataBuf.toString("utf8"));
    }
    /**
     * Get encrypted tier 3 data from the db and return a decrypted object.
     * @param userId user id
     * @returns decrypted json object
     */
    static async getTier3Data(userId: string): Promise<
        Pick<KycModel.PostTier3BodyT, "proofType">
        & Record<"addressProof" | "liveSelfie", string>
        | null
    > {
        const kyc: { tier3Data: string }[] = await sql`
            SELECT tier3_data as "tier3Data"
            FROM kyc
            WHERE user_id = ${userId}
        `
        if (kyc.length === 0 || !kyc[0].tier3Data) return null;
        const dataBuf = decrypt(Buffer.from(kyc[0].tier3Data, "base64"));
        return JSON.parse(dataBuf.toString("utf8"));
    }
}