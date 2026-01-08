import dbSingleton from "@/utils/db";
import { WebhookModel } from "../webhook/model";
import { MonoConnectAuthAccountExchangeTokenArgs, MonoConnectAuthAccountLinkingArgs, MonoConnectAuthAccountLinkingResponseData, MonoResponse } from "@/types/mono.type";
import { MONO } from "@/config";
import { KycService } from "../kyc/service";
import { generateRef } from "@/utils/ref-gen";

const db = dbSingleton()
export class AccountService {
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
	static async createAccount(data: WebhookModel.MonoAccountConnectedBodyType["data"]) {
		return db`INSERT INTO accounts (
            individual_user_id,
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
	static async updateAccount(data: WebhookModel.MonoAccountUpdatedBodyType["data"]) {
		return db`
            UPDATE accounts 
            SET account_number = ${data.account.accountNumber},
                account_name = ${data.account.name},
                account_type = ${data.account.type},
                currency = ${data.account.currency},
                balance = ${data.account.balance},
                institution_name = ${data.account.institution.name},
                institution_bank_code = ${data.account.institution.bankCode},
                institution_type = ${data.account.institution.type},
                mono_auth_method = ${data.meta.auth_method},
                mono_data_status = ${data.meta.data_status}
            WHERE mono_account_id = ${data.account._id}
        `
	}
	static async deleteAccount(data: WebhookModel.MonoAccountUnlinkedBodyType["data"]) {
		return db`DELETE FROM accounts WHERE mono_account_id = ${data.account.id}`
	}
	static async getAccount(userId: string) {
		return db`SELECT * FROM accounts WHERE individual_user_id = ${userId}`
	}
	static async getAccountByMonoAccountId(monoAccountId: string) {
		return db`SELECT * FROM accounts WHERE mono_account_id = ${monoAccountId}`
	}
	static async getAccountByMonoCustomerId(monoCustomerId: string) {
		return db`SELECT * FROM accounts WHERE mono_customer_id = ${monoCustomerId}`
	}
	static async getAccountByMonoReference(monoReference: string) {
		return db`SELECT * FROM accounts WHERE mono_reference = ${monoReference}`
	}
}