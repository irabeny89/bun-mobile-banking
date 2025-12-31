import Elysia from "elysia";
import { tier1Status } from "./routes/tier1-status";
import { tier1Verify } from "./routes/tier1-verify";
import { tier2Status } from "./routes/tier2-status";
import { tier2Verify } from "./routes/tier2-verify";
import { tier3Status } from "./routes/tier3-status";
import { tier3Verify } from "./routes/tier3-verify";
import { uploadPassport } from "./routes/upload-passport";
import { uploadGovtId } from "./routes/upload-govt-id";

export const kyc = new Elysia({
    name: "kyc",
    prefix: "/kyc",
    detail: {
        description: "KYC service to handle KYC related actions."
    },
})
    .use(uploadPassport)
    .use(tier1Status)
    .use(tier1Verify)
    .use(tier2Status)
    .use(tier2Verify)
    .use(tier3Status)
    .use(tier3Verify)
    .use(uploadGovtId)
