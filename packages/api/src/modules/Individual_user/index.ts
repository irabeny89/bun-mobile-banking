/** Controller handle HTTP related operations eg. routing, request validation */
import { me } from "./routes/me";
import Elysia from "elysia";
import { mfa } from "./routes/mfa";

export const individualUser = new Elysia({
    name: "individual-user",
    prefix: "/individuals",
    detail: {
        description:
            "Individual User service to authenticate, authorize and other user related actions.",
    },
})
    .use(me)
    .use(mfa)
