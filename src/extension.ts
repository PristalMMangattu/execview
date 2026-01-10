// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cmds from './commands';
import { getLogger, updateLoggerLevel} from './logger';
import { Logger } from 'winston';

let logger: Logger;

(async () => {
	logger = await getLogger();
	logger.verbose('Logger initialized in extension.ts');
})();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "execview" is now active!');


	const disposable = vscode.commands.registerCommand('execview.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from execview!');
	});

	cmds.registerAllCommands(context);
	context.subscriptions.push(disposable);

	const configurationChangeListener = vscode.workspace.onDidChangeConfiguration(async (event) => {
		if (event.affectsConfiguration('elfviz.logLevel')) {
			await updateLoggerLevel();
		}
	});
	context.subscriptions.push(configurationChangeListener);
}

// This method is called when your extension is deactivated
export function deactivate() {
	logger.info('elfviz deactivation completed.');
}
