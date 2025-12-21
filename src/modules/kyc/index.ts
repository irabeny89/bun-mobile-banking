import Elysia from "elysia";
import { tier1Status } from "./routes/tier1-status";
import { tier1Verify } from "./routes/tier1-verify";
import { tier2Status } from "./routes/tier2-status";
import { tier2Verify } from "./routes/tier2-verify";

export const kyc = new Elysia({
    name: "kyc",
    prefix: "/kyc",
    detail: {
        description: "KYC service to handle KYC related actions."
    }
})
    .use(tier1Status)
    .use(tier1Verify)
    .use(tier2Status)
    .use(tier2Verify)
