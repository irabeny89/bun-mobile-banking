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

	export const transactionsParamsSchema = t.Object({
		accountId: t.String({
			description: "The ID of the account",
			examples: ["695a7f39fbc7fac1166afa45"],
		})
	})
	export type TransactionsParamsT = typeof transactionsParamsSchema.static

	export const transactionsQuerySchema = t.Object({
		start: t.String({
			description: "the beginning date for transaction consideration",
			examples: ["01-10-2020"],
			pattern: "dd-MM-yyyy",
			format: "date",
		}),
		end: t.String({
			description: "the end date for transaction consideration",
			examples: ["07-10-2020"],
			pattern: "dd-MM-yyyy",
			format: "date",
		}),
		narration: t.String({
			description: "filters all transactions by narration",
			examples: ["Uber"],
		}),
		type: t.String({
			description: "filters transactions by debit or credit",
			examples: ["debit", "credit"],
		}),
		paginate: t.Boolean({
			description: "true or false (If you want to receive the data all at once or you want it paginated)",
			examples: [true, false],
		}),
		limit: t.Number({
			description: "limit the number of transactions returned per API call",
			examples: [10],
		}),

	})
	export type TransactionsQueryT = typeof transactionsQuerySchema.static

	export const transactionsSuccessSchema = successSchemaFactory(t.Object({
		transactions: t.Array(t.Object({
			id: t.String(),
			narration: t.String(),
			amount: t.Number(),
			type: t.String(),
			balance: t.Number(),
			date: t.String(),
			category: t.String(),
		}))
	}))
	export type TransactionsSuccessT = typeof transactionsSuccessSchema.static

	export const statementParamsSchema = t.Object({
		accountId: t.String({
			description: "The ID of the account",
			examples: ["695a7f39fbc7fac1166afa45"],
		})
	})
	export type StatementParamsT = typeof statementParamsSchema.static

	export const statementQuerySchema = t.Object({
		action: t.Union([
			t.Object({
				type: t.Literal("generate"),
				period: t.UnionEnum([
					"last1months",
					"last2months",
					"last3months",
					"last4months",
					"last5months",
					"last6months",
					"last7months",
					"last8months",
					"last9months",
					"last10months",
					"last11months",
					"last12months",
				], {
					description: "The period to consider (last1months, last2months, last3months, last4months, last5months, last6months, last7months, last8months, last9months, last10months, last11months, last12months)",
					examples: ["last1months", "last2months", "last3months", "last4months", "last5months", "last6months", "last7months", "last8months", "last9months", "last10months", "last11months", "last12months"],
				}),
			}),
			t.Object({
				type: t.Literal("status"),
				jobId: t.String({
					description: "The ID in the response data of the job from calling the generate action",
					examples: ["TAauhsWhln1GllZMHZgS"],
				}),
			})
		], {
			description: "The action to perform (generate or status)",
			examples: ["generate", "status"],
		}),
	})
	export type StatementQueryT = typeof statementQuerySchema.static

	export const statementSuccessSchema = successSchemaFactory(t.Object({
		id: t.String(),
		status: t.UnionEnum(["BUILDING", "BUILT"]),
		path: t.String(),
	}))
	export type StatementSuccessT = typeof statementSuccessSchema.static
}