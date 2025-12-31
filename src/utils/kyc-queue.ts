import { VALKEY_URL } from "@/config";
import { KycModel } from "@/modules/kyc/model";
import { KycService } from "@/modules/kyc/service";
import { Queue, Worker } from "bullmq";
import { fileStore } from "./storage";
import { MonoInitiateLookupBvnArgs, MonoInitiateLookupBvnResponseData, MonoResponse, MonoVerifyBvnOtpResponseData } from "@/types";

type KycJobT = "bvn_lookup" | "tier_1_insert" | "tier_2_update" | "tier_3_update";
type BvnLookupDataT = Record<"userId", string> & MonoInitiateLookupBvnArgs
type Tier1DataT = {
    userId: string;
} & KycModel.PostTier1BodyT
type Tier2DataT = Record<"userId", string> & KycModel.Tier2DataT
type Tier3DataT = Record<"userId" | "storagePath", string> & KycModel.PostTier3BodyT
type KycJobDataT = Tier1DataT | Tier2DataT | Tier3DataT | BvnLookupDataT

const KYC_QUEUE_NAME = "kyc-insertion" as const;
export const kycQueue = new Queue<KycJobDataT, unknown, KycJobT>(KYC_QUEUE_NAME)
const worker = new Worker<KycJobDataT, unknown, KycJobT>(KYC_QUEUE_NAME, async (job) => {
    if (job.name === "tier_1_insert") {
        console.info("kycQueue.worker.tier_1_insert:: job started")
        const { userId, ...rest } = job.data as Tier1DataT
        await KycService.createKyc(userId, rest)
    }
    if (job.name === "tier_2_update") {
        console.info("kycQueue.worker.tier_2_update:: job started")
        const { userId, ...rest } = job.data as Tier2DataT
        await KycService.updateTier2(userId, rest)
    }
    if (job.name === "tier_3_update") {
        console.info("kycQueue.worker.tier_3_update:: job started")
        // delete the unencrypted file after verification
        const { storagePath, userId, ...rest } = job.data as Tier3DataT
        await Promise.all([
            fileStore.file(storagePath).delete(),
            KycService.updateTier3(userId, rest)
        ])
    }
    if (job.name === "bvn_lookup") {
        console.info("kycQueue.worker.bvn_lookup:: job started")
        const { userId, ...rest } = job.data as BvnLookupDataT
        const initBvnLookupRes = await KycService.monoInitiateBvnLookup(rest)
        if (!initBvnLookupRes.ok) {
            throw new Error("Failed to initiate bvn lookup", {
                cause: await initBvnLookupRes.json()
            })
        }
        const { status: initBvnLookupStatus } = await initBvnLookupRes.json() as MonoResponse<MonoInitiateLookupBvnResponseData>
        if (initBvnLookupStatus === "failed") throw new Error("Failed to initiate bvn lookup")
        const tier1Data = await KycService.getTier1Data(userId)
        if (!tier1Data) throw new Error("Failed to get tier 1 data")
        const verifyBvnOtpResponse = await KycService.monoVerifyBvnOtp({
            method: "phone",
            phone_number: tier1Data.phone
        })
        if (!verifyBvnOtpResponse.ok) {
            throw new Error("Failed to verify bvn otp", {
                cause: await verifyBvnOtpResponse.json()
            })
        }
        const { status: verifyBvnOtpStatus } = await verifyBvnOtpResponse.json() as MonoResponse<MonoVerifyBvnOtpResponseData>
        if (verifyBvnOtpStatus === "failed") throw new Error("Failed to verify bvn otp")
        //* at this point OTP has been sent to the user's phone
        //* this OTP will be used to fetch BVN details
    }
}, { connection: { url: VALKEY_URL } })

worker.on("completed", () => {
    console.info("kycQueue.worker:: job completed")
})

worker.on("failed", (_, error) => {
    console.error(error, "kycQueue.worker.tier_1-verify:: job failed")
})