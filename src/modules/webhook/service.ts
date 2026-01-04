import { WebhookModel } from "./model";
import { AccountService } from "../account/service";

export class WebhookService {
    static async handleMonoAccountConnected(data: WebhookModel.MonoAccountConnectedBodyType["data"]) {
        await AccountService.createAccount(data)
    }
}