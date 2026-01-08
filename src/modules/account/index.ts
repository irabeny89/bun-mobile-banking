import Elysia from "elysia";
import { connect } from "./routes/connect";
import { exchange } from "./routes/exchange";

export const account = new Elysia({
    name: "account",
    prefix: "/account",
    detail: {
        description: "Account management",
    }
})
    .use(connect)
    .use(exchange)