import { WebhookModel } from "./model";
import { AccountService } from "../account/service";

export class WebhookService {
    static async handleMonoAccountConnected(data: WebhookModel.MonoAccountConnectedBodyType["data"]) {
        await AccountService.create(data)
    }
    static async handleMonoAccountUpdated(data: WebhookModel.MonoAccountUpdatedBodyType["data"]) {
        await AccountService.update(data)
    }
    static async handleMonoAccountUnlinked(data: WebhookModel.MonoAccountUnlinkedBodyType["data"]) {
        await AccountService.delete(data)
    }
}