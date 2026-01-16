import * as intf from '../../intf/interface'

type MessageCallback = (message: any) => void;

export class ResposeHandler {
    private messageHandler : Map<string, MessageCallback>;

    constructor() {
        this.messageHandler = new Map();
    }

    public registerHandler(id: string, callback: MessageCallback) {

    }

    public handleResponse(message: intf.Response) {
        const callback = this.messageHandler.get(message.id);
        if (callback) {
            callback(message.out);
        } else {
            console.error(`No message handler registered for, ${message.id}`);
        }
    }
}