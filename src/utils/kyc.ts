import { VALKEY_URL } from "@/config";
import { KycModel } from "@/modules/kyc/model";
import { KycService } from "@/modules/kyc/service";
import { Queue, Worker } from "bullmq";

type KycJobT = "tier_1_insert" | "tier_2_insert" | "tier_3_insert";
type Tier1DataT = {
    userId: string;
} & KycModel.PostTier1BodyT
type KycJobDataT = Tier1DataT

const KYC_QUEUE_NAME = "kyc-insertion" as const;
export const kycQueue = new Queue<KycJobDataT, unknown, KycJobT>(KYC_QUEUE_NAME)
const worker = new Worker<KycJobDataT, unknown, KycJobT>(KYC_QUEUE_NAME, async (job) => {
    if (job.name === "tier_1_insert") {
        console.info("kycQueue.worker.tier_1_insert:: job started")
        await KycService.createKyc(job.data.userId, job.data)
    }
}, { connection: { url: VALKEY_URL } })

worker.on("completed", () => {
    console.info("kycQueue.worker.tier_1-verify:: job completed")
})

worker.on("failed", (_, error) => {
    console.error(error, "kycQueue.worker.tier_1-verify:: job failed")
})