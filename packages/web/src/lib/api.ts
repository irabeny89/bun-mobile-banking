import { treaty } from "@elysiajs/eden"
import type { App } from "~/../../api/src/types"
import { API_URL } from "~/config"

export const eden = treaty<App>(API_URL)