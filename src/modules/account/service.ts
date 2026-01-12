import dbSingleton from "@/utils/db";
import { WebhookModel } from "../webhook/model";
import { MonoAccountStatementQueryT, MonoAccountStatementResponseData, MonoAccountTransactionsResponseData, MonoConnectAuthAccountExchangeTokenArgs, MonoConnectAuthAccountLinkingArgs, MonoConnectReauthAccountLinkingArgs } from "@/types/mono.type";
import { CACHE_GET, MONO, VALKEY_URL } from "@/config";
import { AccountModel } from "./model";
import { Queue, Worker } from "bullmq";
import { getCacheKey } from "@/utils/cache";
import { encrypt } from "@/utils/encryption";
import cacheSingleton from "@/utils/cache";

type JobName = "update-mfa" | "cache-accounts" | "cache-transactions" | "update-statement";
type UpdateMfaJobData = {
	userId: string,
	accountId: string,
	mfa: boolean
}
type CacheAccountsJobData = {
	userId: string;
	accounts: Array<
		Record<"accountNumber", string> &
		Omit<AccountModel.MonoAccountT, "account_number">
	>
}
type CacheTransactionsJobData = {
	userId: string;
	transactions: MonoAccountTransactionsResponseData
}
type UpdateStatementJobData = { accountId: string, userId: string } & MonoAccountStatementResponseData
type JobData = UpdateMfaJobData | CacheAccountsJobData | CacheTransactionsJobData | UpdateStatementJobData

const queueName = "account-update" as const
const db = dbSingleton()
const cache = cacheSingleton()
const worker = new Worker<JobData, unknown, JobName>(queueName, async (job) => {
	console.info("accountQueue.worker:: job started")
	if (job.name === "update-mfa") {
		console.info("accountQueue.worker:: updating mfa")
		const { userId, accountId, mfa } = job.data as UpdateMfaJobData
		await db`
			UPDATE individual_accounts
			SET mfa = ${mfa}
			WHERE user_id = ${userId}
			AND mono_account_id = ${accountId}
		`
	}
	if (job.name === "cache-accounts") {
		console.info("accountQueue.worker:: caching accounts")
		const { userId, accounts } = job.data as CacheAccountsJobData
		const cacheKey = getCacheKey(CACHE_GET.mono.accounts.key, userId)
		await cache.set(cacheKey, encrypt(Buffer.from(JSON.stringify(accounts))))
		await cache.expire(cacheKey, CACHE_GET.mono.accounts.ttl)
	}
	if (job.name === "cache-transactions") {
		console.info("accountQueue.worker:: caching transactions")
		const { userId, transactions } = job.data as CacheTransactionsJobData
		const cacheKey = getCacheKey(CACHE_GET.mono.transactions.key, userId)
		await cache.set(cacheKey, encrypt(Buffer.from(JSON.stringify(transactions))))
		await cache.expire(cacheKey, CACHE_GET.mono.transactions.ttl)
	}
	if (job.name === "update-statement") {
		console.info("accountQueue.worker:: updating statement")
		const { id, path, status, accountId, userId } = job.data as UpdateStatementJobData
		await db`
			UPDATE 
				individual_accounts
			SET 
				mono_statement_id = ${id},
				mono_statement_path = ${path},
				mono_statement_status = ${status}
			WHERE 
				user_id = ${userId}
				AND mono_account_id = ${accountId}
		`
	}
}, { connection: { url: VALKEY_URL } })

worker.on("completed", () => {
	console.info("accountQueue.worker:: job completed")
})

worker.on("failed", (_, error) => {
	console.error(error, "accountQueue.worker:: job failed")
})
export class AccountService {
	static queue = new Queue<JobData, unknown, JobName>(queueName)
	/**
	 * Use this endpoint to initiate account linking on the Mono Connect widget.
	 * @param body Customer details and redirect URL
	 * @returns Mono URL to initiate account linking
	 */
	static async monoInitiateAccountLinking(body: MonoConnectAuthAccountLinkingArgs) {
		return fetch(`${MONO.baseUrl}${MONO.accountInitiatePath}`, {
			headers: MONO.connectHeaders,
			method: "POST",
			body: JSON.stringify(body)
		})
	}
	/**
	 * Use this endpoint to request an account ID (that identifies the authenticated account) after successful enrolment on the Mono Connect widget.
	 * @param body Code returned from Mono Connect
	 * @returns Account ID in response data
	 */
	static async monoExchangeToken(body: MonoConnectAuthAccountExchangeTokenArgs) {
		return fetch(`${MONO.baseUrl}${MONO.accountExchangeTokenPath}`, {
			headers: MONO.connectHeaders,
			method: "POST",
			body: JSON.stringify(body)
		})
	}
	/**
	 * Use this endpoint to re-authorize a previously linked account
	 * @param body Account ID and redirect URL
	 * @returns Mono URL to re-authorize account
	 */
	static async monoReauthorizeAccount(body: MonoConnectReauthAccountLinkingArgs) {
		return fetch(`${MONO.baseUrl}${MONO.accountExchangeTokenPath}`, {
			headers: MONO.connectHeaders,
			method: "POST",
			body: JSON.stringify(body)
		})
	}
	/**
	 * Use this endpoint to get the balance of an account
	 * @param monoAccountId Account ID
	 * @returns Account balance in response data
	 */
	static async monoAccountBalance(monoAccountId: string) {
		return fetch(`${MONO.baseUrl}${MONO.accountPath}/${monoAccountId}/balance`, {
			headers: MONO.connectHeaders,
		})
	}
	/**
	 * Use this endpoint to get the details of an account
	 * @param monoAccountId Account ID
	 * @returns Account details in response data
	 */
	static async monoAccountDetails(monoAccountId: string) {
		return fetch(`${MONO.baseUrl}${MONO.accountPath}/${monoAccountId}`, {
			headers: MONO.connectHeaders,
		})
	}
	/**
	 * Use this endpoint to get the transactions of an account
	 * @param monoAccountId Account ID
	 * @param query Query parameters
	 * @returns Transactions in response data
	 */
	static async monoTransactions(monoAccountId: string, query: AccountModel.TransactionsQueryT) {
		const searchParams = new URLSearchParams({
			...query,
			paginate: query.paginate.toString(),
			limit: query.limit.toString()
		}).toString()
		return fetch(`${MONO.baseUrl}${MONO.accountPath}/${monoAccountId}/transactions?${searchParams}`, {
			headers: MONO.connectHeaders,
		})
	}
	/**
	 * Use this endpoint to generate a statement for an account
	 * @param monoAccountId Account ID
	 * @param query Query parameters
	 * @returns Statement in response data
	 */
	static async monoStatement(monoAccountId: string, query: MonoAccountStatementQueryT) {
		return fetch(`${MONO.baseUrl}${MONO.accountPath}/${monoAccountId}/statement?period=${query.period}&output=${query.output}`, {
			headers: MONO.connectHeaders,
		})
	}
	/**
	 * Use this endpoint to poll the status of a statement job
	 * @param monoAccountId Account ID
	 * @param jobId Job ID
	 * @returns Job status in response data
	 */
	static async monoStatementPollPdfStatus(monoAccountId: string, jobId: string) {
		return fetch(`${MONO.baseUrl}${MONO.accountPath}/${monoAccountId}/statement/jobs/${jobId}`, {
			headers: MONO.connectHeaders,
		})
	}
	/**
	 * Use this endpoint to get all accounts of a user
	 * @param userId User ID
	 * @returns Accounts in response data
	 */
	static async findAll(userId: string) {
		const res: AccountModel.AccountT[] = await db`
			SELECT *
			FROM individual_accounts
			WHERE user_id = ${userId}
			ORDER BY created_at DESC
		`
		return res && res.length ? res : []
	}
	static async create(data: WebhookModel.MonoAccountConnectedBodyType["data"]) {
		return db`INSERT INTO individual_accounts (
            user_id,
            mono_account_id,
            mono_customer_id,
            mono_reference
        ) VALUES (
            ${data.meta.userId},
            ${data.id},
            ${data.customer},
            ${data.meta.ref}
        )`
	}
	static async update(data: WebhookModel.MonoAccountUpdatedBodyType["data"]) {
		return db`
            UPDATE individual_accounts 
            SET mono_data_status = ${data.meta.data_status}
            WHERE mono_account_id = ${data.account._id}
        `
	}
	static async delete(data: WebhookModel.MonoAccountUnlinkedBodyType["data"]) {
		return db`DELETE FROM individual_accounts WHERE mono_account_id = ${data.account.id}`
	}
	static async findByUserId(userId: string) {
		const res: AccountModel.AccountT[] = await db`
			SELECT * FROM individual_accounts WHERE user_id = ${userId}
		`
		return res && res.length ? res[0] : null
	}
	static async findByMonoAccountId(monoAccountId: string) {
		const res: AccountModel.AccountT[] = await db`
			SELECT * FROM individual_accounts WHERE mono_account_id = ${monoAccountId}
		`
		return res && res.length ? res[0] : null
	}
	static async findAccountByMonoCustomerId(monoCustomerId: string) {
		const res: AccountModel.AccountT[] = await db`
			SELECT * FROM individual_accounts WHERE mono_customer_id = ${monoCustomerId}
		`
		return res && res.length ? res[0] : null
	}
	static async findAccountByMonoReference(monoReference: string) {
		const res: AccountModel.AccountT[] = await db`
			SELECT * FROM individual_accounts WHERE mono_reference = ${monoReference}
		`
		return res && res.length ? res[0] : null
	}
}