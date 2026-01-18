import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fsAsync from 'fs/promises';
import * as common from './common';
import * as intf from '../intf/interface';
import * as path from 'path';
import { getLogger} from './logger';
import { Logger } from 'winston';

let logger: Logger;

(async () => {
    logger = await getLogger();
    logger.verbose('Logger initialized in extension.ts');
})();

let webviewPanel: vscode.WebviewPanel | null = null;
let programUnderObservation: string | undefined = undefined;

async function executeReqHandler(id: string, command: intf.Command) : Promise<intf.Response>{
    const config = vscode.workspace.getConfiguration('elfviz');
    let prog: string | undefined = undefined;
    if (command.prog === "readelf") {
        prog = config.get<string>('readelfPath');
    } else if (command.prog === 'objdump') {
        prog = config.get<string>('objdumpPath');
    } else if (command.prog === 'hexdump') {
        prog = config.get<string>('hexdumpPath');
    } else {
        throw new Error(`Request to execute unknown program '${command.prog}'`);
    }

    if (!fs.existsSync(prog!)) {
        throw new Error(`Program "${prog}" does not exist.`);
    }

    const timeout = config.get<number>('commandTimeout') ?? 30;
    const exec = prog + ' ' + command.args.join(' ');
    let result = await common.runProgramAsync(exec, timeout * 1000, command.env);
    if (!result) {
        throw new Error(`Error while executing command : ${command}`);
    }
    let response  = {
        id: id,
        out: result
    };

    return response;
}

async function initReqHandler(id: string) : Promise<intf.Response>{
    if (!programUnderObservation) {
        throw new Error(`Program is not set yet.`);
    }

    let response = {
        id: id,
        out: programUnderObservation
    };

    return response;
}

async function messageHandler(message: intf.Request) {
    logger.info(`Received message ID : ${message.id}`);
    if (!webviewPanel) {
        vscode.window.showErrorMessage('Webview not initialized.');
    }

    let response: intf.Response;
    try {
        if (message.type === intf.RequestType.EXECUTE) {
            response = await executeReqHandler(message.id, message.data as intf.Command);
            webviewPanel?.webview.postMessage(response);
        } else if (message.type === intf.RequestType.INIT) {
            response = await initReqHandler(message.id);
            webviewPanel?.webview.postMessage(response);
        } else {
            throw new Error('Unknow request type.');
        }
    } catch (error) {
        vscode.window.showErrorMessage(String(error));
    }
}

export async function renderWebview(): Promise<vscode.WebviewPanel> {
    const context = common.getExtensionContext();
    if (!context) {
        throw new Error('Extension context is not available');
    } else {
        logger.info('webview.ts::renderWebview : Extension context is available');
    }

    const viewRootUri = vscode.Uri.file(path.join(context.extensionPath, 'view/dist'));
    if (!fs.existsSync(viewRootUri.fsPath)) {
        throw new Error(`Views root path not found : ${viewRootUri.fsPath}`);
    } else {
        logger.verbose(`Webview root : ${viewRootUri.fsPath}`);
    }

    const webviewPanel = vscode.window.createWebviewPanel(
        'elfviz',
        'Elf Binary Visualizer',
        vscode.ViewColumn.Active,
        {
            localResourceRoots: [
                viewRootUri
            ],
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    const htmlPath = vscode.Uri.file(path.join(context.extensionPath, 'view/dist/index.html'));
    const htmlContent = await fsAsync.readFile(htmlPath.fsPath, 'utf8');


    const baseUri = webviewPanel.webview.asWebviewUri(viewRootUri);  // true = query-encoded

    // Replace relative paths with asWebviewUri-resolved paths
    let html = htmlContent.replace(
        /src=["'](\.\/[^"']*)["']/g,
        (match, p1) => {
            console.log('Captured:', p1);  // Should log: ./app.js
            return `src="${webviewPanel.webview.asWebviewUri(vscode.Uri.joinPath(baseUri, p1))}"`;
        });

    webviewPanel.webview.html = html;

    return webviewPanel;
}

export async function setupWebview(prog: string): Promise<vscode.WebviewPanel | null> {
    programUnderObservation = prog;
    if (webviewPanel) {
        logger.info('Webview Panel already exists..');
        webviewPanel.reveal(vscode.ViewColumn.Active);
        return webviewPanel;
    }
    try {
        logger.info('Creating a webview panel.');
        webviewPanel = await renderWebview();

        if (!webviewPanel) {
            logger.error('Failed to render webview.');
            return null;
        }

        // Store the event listener
        webviewPanel.webview.onDidReceiveMessage(
            messageHandler,
            undefined,
            common.getExtensionContext()?.subscriptions
        );

        webviewPanel.onDidDispose(() => {
            logger.info('Webview disposed.');
            webviewPanel = null;
        });

        

    } catch(error) {
        logger.error(`Webview setup error : ${error}`);
        return null;
    }

    return webviewPanel;
}
