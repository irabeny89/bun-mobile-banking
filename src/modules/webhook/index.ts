import Elysia from "elysia";

export const webhook = new Elysia({
    name: "webhook",
    prefix: "/webhook",
    detail: {
        description: "Webhook service to handle webhook related actions."
    }
})
.use