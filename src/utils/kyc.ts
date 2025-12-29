import { VALKEY_URL } from "@/config";
import { KycModel } from "@/modules/kyc/model";
import { KycService } from "@/modules/kyc/service";
import { Queue, Worker } from "bullmq";
import { fileStore } from "./storage";

type KycJobT = "tier_1_insert" | "tier_2_update" | "tier_3_update";
type Tier1DataT = {
    userId: string;
} & KycModel.PostTier1BodyT
type Tier2DataT = {
    userId: string;
} & KycModel.PostTier2BodyT
type Tier3DataT = {
    userId: string,
    storagePath: string
} & KycModel.PostTier3BodyT
type KycJobDataT = Tier1DataT | Tier2DataT | Tier3DataT

const KYC_QUEUE_NAME = "kyc-insertion" as const;
export const kycQueue = new Queue<KycJobDataT, unknown, KycJobT>(KYC_QUEUE_NAME)
const worker = new Worker<KycJobDataT, unknown, KycJobT>(KYC_QUEUE_NAME, async (job) => {
    if (job.name === "tier_1_insert") {
        console.info("kycQueue.worker.tier_1_insert:: job started")
        await KycService.createKyc(job.data.userId, job.data as Tier1DataT)
    }
    if (job.name === "tier_2_update") {
        console.info("kycQueue.worker.tier_2_update:: job started")
        await KycService.updateTier2(job.data.userId, job.data as Tier2DataT)
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
}, { connection: { url: VALKEY_URL } })

worker.on("completed", () => {
    console.info("kycQueue.worker:: job completed")
})

worker.on("failed", (_, error) => {
    console.error(error, "kycQueue.worker.tier_1-verify:: job failed")
})