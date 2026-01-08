import { t } from "elysia";
import { successSchemaFactory } from "@/utils/response";

export namespace AccountModel {
	export const Account = t.Object({
		id: t.String({ format: "uuid" }),
		individualUserId: t.String({ format: "uuid" }),
		accountNumber: t.String(),
		accountName: t.String(),
		accountType: t.String(),
		currency: t.String(),
		balance: t.String(),
		institutionId: t.String(),
		institutionName: t.String(),
		institutionBankCode: t.String(),
		institutionType: t.String(),
		institutionAuthMethod: t.String(),
		monoAccountId: t.String(),
		monoCustomerId: t.String(),
		monoReference: t.String(),
		monoReauthorize: t.Boolean(),
		monoDataStatus: t.String(),
		isMultiFactor: t.Boolean(),
		createdAt: t.String({ format: "date-time" }),
		updatedAt: t.String({ format: "date-time" }),
	})
	export type AccountT = typeof Account.static

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

	export const reconnectSuccessSchema = successSchemaFactory(t.Object({
		message: t.Literal("Account reconnected successfully"),
		accountId: t.String()
	}))
	export type ReconnectSuccessT = typeof reconnectSuccessSchema.static
}