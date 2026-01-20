import * as intf from '../../intf/interface'
import * as elf from './elf'



export interface State {
    program: string,
    interpreter: string,
    elfHeader: elf.ElfHeader,
    programHeaders: elf.ProgramHeader[],
    sectionHeaders: elf.SectionHeader[]
}

export function setStatePartial(vscode: any, partial: Partial<State>): void {
    const current = (vscode.getState() as State) || { program: '', interpreter: '', elfHeader: {} as elf.ElfHeader, programHeaders: [] as elf.ProgramHeader[], sectionHeaders: [] as elf.SectionHeader[]};
    vscode.setState({ ...current, ...partial } as State);
}

type MessageCallback = (message: any) => void;

export class ResposeHandler {
    private messageHandler : Map<string, MessageCallback>;

    constructor() {
        this.messageHandler = new Map();
    }

    public registerHandler(id: string, callback: MessageCallback) {
        if (this.messageHandler.has(id)) {
            console.warn(`Handler '${id}' is already registed.`);
            return;
        }

        console.log(`Registering call back for message ID, '${id}'`);
        this.messageHandler.set(id, callback);
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

// This function sends section header info for populating activity bar
export function sendSectionHeaderToWebview(vscode: any, data: elf.SectionHeader[]) {
    const headers = data.map(obj => obj.Name);
    const activity = { 
        header: intf.HeaderType.SECT,
        data: headers
    } as intf.ActivityBar;

    const msg = {
        id: "sec-activity",
        type: intf.RequestType.ACTIVITY,
        data: activity
    } as intf.Request;

    vscode.postMessage(msg);
}

// This function sends section header info for populating activity bar
export function sendProgramHeaderToWebview(vscode:any, data: elf.ProgramHeader[]) {
    const headers = data.map(obj => obj.Type);
    const activity = { 
        header: intf.HeaderType.PROG,
        data: headers
    } as intf.ActivityBar;

    const msg = {
        id: "sec-activity",
        type: intf.RequestType.ACTIVITY,
        data: activity
    } as intf.Request;
    
    vscode.postMessage(msg);
}
