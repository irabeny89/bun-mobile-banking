import { WebhookModel } from "./model";
import { AccountService } from "../account/service";

export class WebhookService {
    static async handleMonoAccountConnected(data: WebhookModel.MonoAccountConnectedBodyType["data"]) {
        await AccountService.createAccount(data)
    }
    static async handleMonoAccountUpdated(data: WebhookModel.MonoAccountUpdatedBodyType["data"]) {
        await AccountService.updateAccount(data)
    }
}