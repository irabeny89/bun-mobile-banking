/** Controller handle HTTP related operations eg. routing, request validation */

import Elysia from "elysia";
import { registerIndividual } from "./routes/register-individual";
import { registerIndividualComplete } from "./routes/register-individual-complete";
import { loginIndividual } from "./routes/login-individual";
import { loginMfaIndividual } from "./routes/login-mfa-individual";
import { refreshTokenIndividual } from "./routes/refresh-token-individual";
import { forgotPasswordIndividual } from "./routes/forgot-password-individual";

export const auth = new Elysia({
    prefix: "/auth",
    detail: {
        description:
            "Authentication and onboarding service to authenticate, authorize and onboard users.",
    },
})
    .use(registerIndividual)
    .use(registerIndividualComplete)
    .use(loginIndividual)
    .use(loginMfaIndividual)
    .use(refreshTokenIndividual)
    .use(forgotPasswordIndividual)
