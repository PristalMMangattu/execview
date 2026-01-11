import * as vscode from 'vscode';
import * as view from './webview';
import { getLogger} from './logger';
import { Logger } from 'winston';

let logger: Logger;

(async () => {
    logger = await getLogger();
})();

async function openFile() {
    console.log("Open file is clicked.");
    let filePath = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: "/usr/bin/ls",
        prompt: "Select the binary object file.",
        title: "Binary Object File."
    });

    logger.info(`${filePath} is selected`);

    const webView = view.setupWebview();
}


export function registerAllCommands(context: vscode.ExtensionContext) {
    let disposables: vscode.Disposable[] = [];
    disposables.push(
        vscode.commands.registerCommand("elfviz.openFile", openFile)
    );

    context.subscriptions.concat(disposables);
}
