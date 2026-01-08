import Elysia from "elysia";
import { connect } from "./routes/connect";

export const account = new Elysia({
    name: "account",
    prefix: "/account",
    detail: {
        description: "Account management",
    }
})
    .use(connect)