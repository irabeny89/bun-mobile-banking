import dbSingleton from "@/utils/db";
import { WebhookModel } from "../webhook/model";

const db = dbSingleton()
export class AccountService {
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
}