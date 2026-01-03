import dbSingleton from "@/utils/db";
import { KycModel } from "./model";
import { DOJAH, IS_PROD_ENV, MONO, MONO_BVN_SESSION_ID_CACHE_KEY, STORAGE } from "@/config";
import { DojahBvnValidateArgs, DojahLiveSelfieVerifyArgs, DojahLiveSelfieVerifyResponse, DojahNinLookupArgs, DojahUtilityBillVerifyArgs, DojahUtilityBillVerifyResponse, DojahVinLookupArgs, DojahVinLookupResponse, PrettyReplace } from "@/types";
import { MonoBvnDetailsArgs, MonoBvnDetailsResponseData, MonoInitiateLookupBvnArgs, MonoLookupDriverLicenseArgs, MonoLookupNinArgs, MonoLookupNinResponseData, MonoLookupPassportArgs, MonoResponse, MonoVerifyBvnOtpArgs } from "@/types/mono.type"
import { decrypt, encrypt } from "@/utils/encryption";
import { fileStore, getUploadLocation } from "@/utils/storage";
import { CommonSchema } from "@/share/schema";
import cacheSingleton, { getCacheKey } from "@/utils/cache";

const sql = dbSingleton();
const cache = cacheSingleton();
export class KycService {
    /**
     * Lookup NIN
     * 
     * N.B - sandbox values are used when `IS_PROD_ENV` is false
     * 
     * @param param0 NIN to lookup
     * @returns Mono response
     */
    static async monoLookupNin({ nin }: MonoLookupNinArgs) {
        const lookupArgs: MonoLookupNinArgs = IS_PROD_ENV
            ? { nin }
            : { nin: MONO.sandbox.nin }
        return fetch(`${MONO.baseUrl}${MONO.lookupNinPath}`, {
            headers: MONO.headers,
            method: "POST",
            body: JSON.stringify(lookupArgs)
        });
    }

    /**
     * Initiate BVN lookup
     * 
     * N.B - sandbox values are used when `IS_PROD_ENV` is false
     * 
     * @param args object with BVN to lookup
     * @returns Mono response
     */
    static async monoInitiateBvnLookup(args: MonoInitiateLookupBvnArgs) {
        const lookupArgs: MonoInitiateLookupBvnArgs = IS_PROD_ENV
            ? args
            : { bvn: MONO.sandbox.bvn.bvn }
        return fetch(`${MONO.baseUrl}${MONO.lookupBvnPath}/initiate`, {
            headers: MONO.headers,
            method: "POST",
            body: JSON.stringify(lookupArgs)
        });
    }

    /**
     * Verify BVN OTP by setting methods to authorize BVN data lookup
     * 
     * N.B - sandbox values are used when `IS_PROD_ENV` is false
     * 
     * @param sessionId Session ID
     * @param args object with method and phone number to verify BVN OTP
     * @returns Mono response
     */
    static async monoVerifyBvnOtp(sessionId: string, args: MonoVerifyBvnOtpArgs) {
        const verifyArgs: MonoVerifyBvnOtpArgs = IS_PROD_ENV
            ? args
            : {
                method: "alternate_phone",
                phone_number: MONO.sandbox.bvn.alternatePhone,
            }
        return fetch(`${MONO.baseUrl}${MONO.lookupBvnPath}/verify`, {
            headers: { ...MONO.headers, "x-session-id": sessionId },
            method: "POST",
            body: JSON.stringify(verifyArgs)
        });
    }

    /**
     * Fetch BVN details
     * 
     * N.B - sandbox values are used when `IS_PROD_ENV` is false
     * 
     * @param sessionId Session ID
     * @param args object with OTP to fetch BVN details
     * @returns Mono response
     */
    static async monoFetchBvnDetails(sessionId: string, args: MonoBvnDetailsArgs) {
        const detailsArgs: MonoBvnDetailsArgs = IS_PROD_ENV
            ? args
            : { otp: MONO.sandbox.bvn.otp }
        return fetch(`${MONO.baseUrl}${MONO.lookupBvnPath}/details`, {
            headers: { ...MONO.headers, "x-session-id": sessionId },
            method: "POST",
            body: JSON.stringify(detailsArgs)
        });
    }

    /**
     * Lookup international passport
     * 
     * N.B - sandbox values are used when `IS_PROD_ENV` is false
     * 
     * @param args object with passport number, last name and date of birth to lookup passport
     * @returns Mono response
     */
    static async monoLookupPassport(args: MonoLookupPassportArgs) {
        const lookupArgs: MonoLookupPassportArgs = IS_PROD_ENV
            ? args
            : {
                passport_number: MONO.sandbox.intlPassport.passportNumber,
                last_name: MONO.sandbox.intlPassport.lastName,
                date_of_birth: MONO.sandbox.driverLicense.dateOfBirth,
            }
        return fetch(`${MONO.baseUrl}${MONO.lookupPassportPath}`, {
            headers: MONO.headers,
            method: "POST",
            body: JSON.stringify(lookupArgs)
        });
    }

    /**
     * Lookup driver license
     * 
     * N.B - sandbox values are used when `IS_PROD_ENV` is false
     * 
     * @param args object with license number, first name, last name and date of birth to lookup driver license
     * @returns Mono response
     */
    static async monoLookupDriverLicense(args: MonoLookupDriverLicenseArgs) {
        const lookupArgs: MonoLookupDriverLicenseArgs = IS_PROD_ENV
            ? args
            : {
                license_number: MONO.sandbox.driverLicense.licenseNumber,
                first_name: MONO.sandbox.driverLicense.firstName,
                last_name: MONO.sandbox.driverLicense.lastName,
                date_of_birth: MONO.sandbox.driverLicense.dateOfBirth,
            }
        return fetch(`${MONO.baseUrl}${MONO.lookupDriverLicensePath}`, {
            headers: MONO.headers,
            method: "POST",
            body: JSON.stringify(lookupArgs)
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
    static async livenessCheckWithDojah(liveSelfie: File) {
        const livenessErrMsg = "Verification failed - Liveness check failed"
        const res = await this.dojahVerifySelfie({
            image: Buffer.from(await liveSelfie.arrayBuffer()).toString("base64")
        })
        if (!res.ok) throw new Error(livenessErrMsg, { cause: await res.json() })
        const { entity: { liveness } } = await res.json() as DojahLiveSelfieVerifyResponse
        if (!liveness.liveness_check || liveness.liveness_probability < 0.5) {
            throw new Error(livenessErrMsg)
        }
    }
    static async verifyUtilityBillWithDojah(addressProofFile: File, userId: string, userType: CommonSchema.UserType) {
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
        if (tier1Data.street.toLowerCase() !== address_info.street.toLowerCase()) throw new Error(streetErrMsg)
        if (tier1Data.city.toLowerCase() !== address_info.city.toLowerCase()) throw new Error(cityErrMsg)
        if (tier1Data.state.toLowerCase() !== address_info.state.toLowerCase()) throw new Error(stateErrMsg)
    }
    static async handleDojahVinLookup(vin: string) {
        const vinErrMsg = "Verification failed - VIN lookup failed"
        const vinMismatchErrMsg = "Verification failed - VIN mismatch"
        const res = await KycService.dojahLookupVin({ vin })
        if (!res.ok) throw new Error(vinErrMsg, { cause: await res.json() })
        const data = await res.json() as DojahVinLookupResponse
        if (data.entity.voter_identification_number !== vin) throw new Error(vinMismatchErrMsg)
    }
    static async verifyTier1Nin(userId: string, body: KycModel.PostTier1BodyT) {
        const tier1StatusErrMsg = "Verification failed - Tier 1 status already verified"
        const ninHashExistsErrMsg = "Verification failed - NIN already verified"
        const ninLookupErrMsg = "Verification failed - NIN lookup failed"
        const nameMismatchErrMsg = "Verification failed - Name mismatch"
        const dobMismatchErrMsg = "Verification failed - Date of birth mismatch"

        const [tier1Status, ninHashExists] = await Promise.all([
            this.getTier1Status(userId),
            this.ninHashExists(body.nin)
        ])
        if (tier1Status) throw new Error(tier1StatusErrMsg)
        if (ninHashExists) throw new Error(ninHashExistsErrMsg)
        const res = await this.monoLookupNin({ nin: body.nin })
        if (!res.ok) throw new Error(ninLookupErrMsg, { cause: await res.json() })
        const { data } = await res.json() as MonoResponse<MonoLookupNinResponseData>
        if (IS_PROD_ENV && (data.firstname !== body.firstName || data.surname !== body.lastName)) {
            throw new Error(nameMismatchErrMsg)
        }
        const date = new Intl.DateTimeFormat()
        const formattedLookupDate = date.format(new Date(data.birthdate))
        const formattedBodyDate = date.format(new Date(body.dob))
        if (IS_PROD_ENV && (formattedBodyDate !== formattedLookupDate)) throw new Error(dobMismatchErrMsg)
    }
    static async handleBvnVerify(userId: string, bvnOtp: string) {
        const bvnDetailsErrMsg = "Verification failed - expired session id"
        const watchlistedErrMsg = "Verification failed - User is watchlisted"
        const sessionId = await cache.get(getCacheKey(MONO_BVN_SESSION_ID_CACHE_KEY, userId))
        if (!sessionId) throw new Error(bvnDetailsErrMsg)
        const response = await this.monoFetchBvnDetails(sessionId, { otp: bvnOtp })
        if (!response.ok) {
            const errData = await response.json()
            throw new Error(`${bvnDetailsErrMsg}, ${errData.message}`)
        }
        const { data } = await response.json() as MonoResponse<MonoBvnDetailsResponseData>
        if (IS_PROD_ENV && data.watch_listed) throw new Error(watchlistedErrMsg)
        return data
    }
    static async handlePassportVerifyWithMono(userId: string, passport_number: string) {
        const tier1DataErrMsg = "Verification failed - Tier 1 data not found"
        const tier1Data = await this.getTier1Data(userId)
        if (!tier1Data) throw new Error(tier1DataErrMsg)
        const res = await this.monoLookupPassport({
            passport_number,
            date_of_birth: tier1Data.dob.split("T")[0],
            last_name: tier1Data.lastName
        })
        if (!res.ok) {
            const errData = await res.json()
            throw new Error(errData.message)
        }
        //* no error means verification completed successfully
    }
    static async handleDriverLicenseVerifyWithMono(userId: string, license_number: string) {
        const tier1DataErrMsg = "Verification failed - Tier 1 data not found"
        const tier1Data = await this.getTier1Data(userId)
        if (!tier1Data) throw new Error(tier1DataErrMsg)
        const res = await this.monoLookupDriverLicense({
            license_number,
            date_of_birth: new Date(tier1Data.dob).toISOString().split("T")[0],
            first_name: tier1Data.firstName,
            last_name: tier1Data.lastName
        })
        if (!res.ok) {
            const errData = await res.json()
            throw new Error(errData.message)
        }
        //* no error means verification completed successfully
    }
    /**
     * Create a new kyc record in the database with encrypted tier 1 data.
     * @param userId user id
     * @param data tier 1 data
     */
    static async createKyc(userId: string, data: Omit<
        KycModel.PostTier1BodyT, "passportPhoto"
    > & Record<"passportPhoto", string>) {
        const tier1Data = encrypt(Buffer.from(JSON.stringify(data)));
        const ninHash = await Bun.password.hash(data.nin)
        await sql`
            INSERT INTO kyc (user_id, tier1_data, nin_hash, tier1_status)
            VALUES (${userId}, ${tier1Data}, ${ninHash}, 'success')
        `
    }
    static async ninHashExists(nin: string) {
        const hash = await Bun.password.hash(nin)
        const kyc = await sql`
            SELECT EXISTS(SELECT 1 FROM kyc WHERE nin_hash = ${hash})
        `
        return kyc[0].exists as boolean
    }
    static async bvnHashExists(bvn: string) {
        const hash = await Bun.password.hash(bvn)
        const kyc = await sql`
            SELECT EXISTS(SELECT 1 FROM kyc WHERE bvn_hash = ${hash})
        `
        return kyc[0].exists as boolean
    }
    /**
     * Get the tier 1 status of a user.
     * @param userId user id
     * @returns tier 1 status
     */
    static async getTier1Status(userId: string) {
        const kyc: Pick<KycModel.DbDataT, "currentTier" | "tier1Status" | "ninHash">[] = await sql`
            SELECT 
                current_tier as "currentTier", 
                tier1_status as "tier1Status",
                nin_hash as "ninHash"
            FROM kyc
            WHERE user_id = ${userId}
        `
        return kyc[0] ? {
            currentTier: kyc[0].currentTier,
            tier1Status: kyc[0].tier1Status,
            ninHash: kyc[0].ninHash
        } : null;
    }
    static async getTier2Status(userId: string) {
        const kyc: Pick<KycModel.DbDataT, "currentTier" | "tier2Status" | "bvnHash">[] = await sql`
            SELECT 
                current_tier as "currentTier", 
                tier2_status as "tier2Status",
                bvn_hash as "bvnHash"
            FROM kyc
            WHERE user_id = ${userId}
        `
        return kyc[0] ? {
            currentTier: kyc[0].currentTier,
            tier2Status: kyc[0].tier2Status,
            bvnHash: kyc[0].bvnHash
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
    static async updateTier2(userId: string, data: KycModel.Tier2DataT) {
        const tier2Data = encrypt(Buffer.from(JSON.stringify(data)));
        const bvnHash = await Bun.password.hash(data.bvn)
        await sql`
            UPDATE kyc
            SET 
                tier2_data = ${tier2Data}, 
                tier2_status = 'success',
                bvn_hash = ${bvnHash},
                current_tier = 'tier_2'
            WHERE user_id = ${userId}
        `
    }
    static async updateTier3(userId: string, data: KycModel.PostTier3BodyT) {
        const addressProofUploadLocation = getUploadLocation(STORAGE.addressProofPath, "individual", userId, "enc")
        const selfieUploadLocation = getUploadLocation(STORAGE.liveSelfiePath, "individual", userId, "enc")
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
        PrettyReplace<KycModel.PostTier1BodyT, "dob", string> | null
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