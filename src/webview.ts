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


function messageHandler(message: intf.ExecuteCommand) {
    logger.info(`Received command to execute : ${message.COMMAND}`);
    if (!webviewPanel) {
        vscode.window.showErrorMessage('Webview not initialized.');
    }

    webviewPanel?.webview.postMessage( {
        STDOUT: "Hi I am from webview..",
        STDERR: "None",
        EXIT_CODE: 0
    } );
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

export async function setupWebview(): Promise<vscode.WebviewPanel | null> {
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
