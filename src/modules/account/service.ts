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
}