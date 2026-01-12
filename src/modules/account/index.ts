import Elysia from "elysia";
import { connect } from "./routes/connect";
import { exchange } from "./routes/exchange";
import { reconnect } from "./routes/reconnect";
import { list } from "./routes/list";
import { transactions } from "./routes/transactions";

export const account = new Elysia({
    name: "account",
    prefix: "/accounts",
    detail: {
        description: "Account management",
    }
})
    .use(connect)
    .use(exchange)
    .use(reconnect)
    .use(list)
    .use(transactions)