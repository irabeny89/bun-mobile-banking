import Elysia from "elysia";
import { tier1Status } from "./routes/tier1-status";

export const kyc = new Elysia({ 
    name: "kyc",
    prefix: "/kyc",
    detail: {
        description: "KYC service to handle KYC related actions."
    }
})
    .use(tier1Status)
