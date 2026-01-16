import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fsAsync from 'fs/promises';
import * as common from './common';
import * as view from './webview';
import { getLogger} from './logger';
import { Logger } from 'winston';

let logger: Logger;

(async () => {
    logger = await getLogger();
})();

async function isValidElfFile(prog: string): Promise<boolean> {
    if (!fs.existsSync(prog)) {
        return false;
    }

    const config = vscode.workspace.getConfiguration('elfviz');
    const fileUtilPath = config.get<string>('fileUtilPath');
    if (!fileUtilPath) {
        throw new Error(`Set 'fileUtilPath' in settings.`);
    }
    if (!fs.existsSync(fileUtilPath)) {
        throw new Error(`File utility'${fileUtilPath}' does not exist.`);
    }
    const command = fileUtilPath + ' ' + prog;
    const timeout = config.get<number>('commandTimeout');
    if (!timeout) {
        throw new Error(`Set 'commandTimeout' in settings.`);
    }
    const result = await common.runProgramAsync(command, timeout);

    if (!result) {
        throw new Error(`Issue while executing 'file' command`)
    }

    if (result.EXIT_CODE != 0) {
        throw new Error(`'file' command returned exit code '${String(result.EXIT_CODE)}' (non-zero).`)
    }

    // Check if 'ELF' string is present in file command output.
    const out = result.STDOUT;
    logger.info(`file command out : ${out}`);
    if (/ELF/.test(out)) {
        return true;
    } else {
        return false;
    }

}

async function openFile() {
    console.log("Open file is clicked.");
    let filePath = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: "/usr/bin/ls",
        prompt: "Select the binary object file.",
        title: "Binary Object File."
    });

    if (!filePath) {
        return null;
    }
    logger.info(`${filePath} is selected`);

    try {
        // check if program is valid ELF file.
        if (! await isValidElfFile(filePath)) {
            vscode.window.showErrorMessage(`'${filePath}' is not a valid ELF file.`);
            return null;
        }
    } catch (error) {
        vscode.window.showErrorMessage(String(error));
    }

    const webView = view.setupWebview(filePath);
}


export function registerAllCommands(context: vscode.ExtensionContext) {
    let disposables: vscode.Disposable[] = [];
    disposables.push(
        vscode.commands.registerCommand("elfviz.openFile", openFile)
    );

    context.subscriptions.concat(disposables);
}
