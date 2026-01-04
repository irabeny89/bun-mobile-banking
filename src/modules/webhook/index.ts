import Elysia from "elysia";
import { monoWebhook } from "./routes/mono";

export const webhook = new Elysia({
    name: "webhook",
    prefix: "/webhooks",
})
.use(monoWebhook)