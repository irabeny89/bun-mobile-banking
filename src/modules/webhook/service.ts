import { WebhookModel } from "./model";
import { AccountService } from "../account/service";
import { MonoAccountBalanceResponseData, MonoResponse } from "@/types/mono.type";

export class WebhookService {
    static async handleMonoAccountConnected(data: WebhookModel.MonoAccountConnectedBodyType["data"]) {
        await AccountService.createAccount(data)
    }
    static async handleMonoAccountUpdated(data: WebhookModel.MonoAccountUpdatedBodyType["data"]) {
        const res = await AccountService.monoAccountBalance(data.account._id)
        if (!res.ok) throw new Error((await res.json()).message)
        const { data: { balance } } = (await res.json()) as MonoResponse<MonoAccountBalanceResponseData>
        await AccountService.updateAccount(data, BigInt(balance))
    }
    static async handleMonoAccountUnlinked(data: WebhookModel.MonoAccountUnlinkedBodyType["data"]) {
        await AccountService.deleteAccount(data)
    }
}