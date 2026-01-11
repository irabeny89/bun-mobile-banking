import { t } from "elysia";
import { successSchemaFactory } from "@/utils/response";

export namespace AccountModel {
	export const Account = t.Object({
		id: t.String({ format: "uuid" }),
		userId: t.String({ format: "uuid" }),
		monoAccountId: t.String(),
		monoCustomerId: t.String(),
		monoReference: t.String(),
		monoDataStatus: t.String(),
		monoReauthorize: t.Boolean(),
		mfa: t.Boolean(),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	})
	export type AccountT = typeof Account.static

	export const MonoAccount = t.Object({
		id: t.String(),
		name: t.String(),
		accountNumber: t.String(),
		currency: t.String(),
		balance: t.Number(),
		type: t.String(),
		bvn: t.String(),
		institution: t.Object({
			name: t.String(),
			bank_code: t.String(),
			type: t.String()
		})
	})
	export type MonoAccountT = typeof MonoAccount.static

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

	export const reconnectBodySchema = t.Object({
		accountId: t.String()
	})

	export const reconnectSuccessSchema = successSchemaFactory(t.Object({
		message: t.Literal("Account reconnected successfully"),
		accountId: t.String()
	}))
	export type ReconnectSuccessT = typeof reconnectSuccessSchema.static

	export const accountListSuccessSchema = successSchemaFactory(t.Object({
		accounts: t.Array(MonoAccount)
	}))
	export type AccountListSuccessT = typeof accountListSuccessSchema.static
}