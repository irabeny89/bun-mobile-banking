/** Controller handle HTTP related operations eg. routing, request validation */

import Elysia from "elysia";
import { jwtPlugin } from "@/plugins/jwt.plugin";
import { registerIndividualUser } from "./routes/register-individual-user";
import { registerIndividualUserComplete } from "./routes/register-individual-complete";
import { loginIndividualUser } from "./routes/login-individual-user";
import { loginMfaIndividualUser } from "./routes/login-mfa-individual-user";

export const auth = new Elysia({
    prefix: "/auth",
    detail: {
        tags: ["Auth"],
        description:
            "Authentication and onboarding service to authenticate, authorize and onboard users.",
    },
})
    .use(jwtPlugin)
    .use(registerIndividualUser)
    .use(registerIndividualUserComplete)
    .use(loginIndividualUser)
    .use(loginMfaIndividualUser)
