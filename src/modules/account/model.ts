import { t } from "elysia";
import { successSchemaFactory } from "@/utils/response";

export namespace AccountModel {
	export const connectSuccessSchema = successSchemaFactory(t.Object({
		message: t.Literal("Click the link to connect your account"),
		connectUrl: t.String()
	}))
	export type ConnectSuccessT = typeof connectSuccessSchema.static

	export const exchangeBodySchema = t.Object({
		connectToken: t.String({
			description: "Code received when you linked an account"
		})
	})
	export type ExchangeBodyT = typeof exchangeBodySchema.static

	export const exchangeSuccessSchema = successSchemaFactory(t.Object({
		message: t.Literal("Account linked successfully"),
		accountId: t.String()
	}))
	export type ExchangeSuccessT = typeof exchangeSuccessSchema.static
}