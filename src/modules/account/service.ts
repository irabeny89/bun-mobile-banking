import dbSingleton from "@/utils/db";
import { WebhookModel } from "../webhook/model";
import { MonoConnectAuthAccountExchangeTokenArgs, MonoConnectAuthAccountLinkingArgs, MonoConnectReauthAccountLinkingArgs } from "@/types/mono.type";
import { CACHE_GET, MONO, VALKEY_URL } from "@/config";
import { AccountModel } from "./model";
import { Queue, Worker } from "bullmq";
import { CACHE_GET_HEADER_VALUE } from "@/types";
import { getCacheKey } from "@/utils/cache";
import { encrypt } from "@/utils/encryption";
import cacheSingleton from "@/utils/cache";

type JobName = "update-mfa" | "cache-accounts"
type UpdateMfaJobData = {
	userId: string,
	reference: string,
	mfa: boolean
}
type CacheAccountsJobData = {
	userId: string;
	accounts: Array<
		Record<"accountNumber", string> &
		Omit<AccountModel.MonoAccountT, "account_number">
	>
}
type JobData = UpdateMfaJobData | CacheAccountsJobData

const queueName = "account-update" as const
const db = dbSingleton()
const cache = cacheSingleton()
const worker = new Worker<JobData, unknown, JobName>(queueName, async (job) => {
	console.info("accountQueue.worker:: job started")
	if (job.name === "update-mfa") {
		console.info("accountQueue.worker:: updating mfa")
		const { userId, reference, mfa } = job.data as UpdateMfaJobData
		await db`
			UPDATE individual_accounts
			SET mfa = ${mfa}
			WHERE mono_reference = ${reference}
			AND user_id = ${userId}
		`
	}
	if (job.name === "cache-accounts") {
		console.info("accountQueue.worker:: caching accounts")
		const { userId, accounts } = job.data as CacheAccountsJobData
		const cacheKey = getCacheKey(CACHE_GET.monoAccounts.key, userId)
		await cache.set(cacheKey, encrypt(Buffer.from(JSON.stringify(accounts))))
		await cache.expire(cacheKey, CACHE_GET.monoAccounts.ttl)
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