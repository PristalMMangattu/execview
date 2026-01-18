import { exec, spawn } from 'child_process';
import * as vscode from 'vscode';
import * as intf from '../intf/interface';
import { getLogger} from './logger';
import { Logger } from 'winston';

let logger: Logger;

(async () => {
    logger = await getLogger();
})();

let extensionContext: vscode.ExtensionContext | undefined;



export async function runProgramAsync(command: string, timeout: number, env?: Record<string, string>): Promise<intf.Result | null> {
    logger.info(`Executing command : ${command}`);
    return new Promise<intf.Result | null>((resolve, reject) => {
        const [cmd, ...args] = command.split(' ');
        const spawnOptions: any = { shell: true };
    
        if (env) {
            spawnOptions.env = { ...process.env, ...env };
        }

        const child = spawn(cmd, args, spawnOptions);

        let stdoutData = '';
        let stderrData = '';
        let exitCode : number;

        const timeoutId = setTimeout(() => {
            child.kill();
            reject(new Error('Command timed out'));
        }, timeout);

        child.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        child.on('close', (code) => {
            clearTimeout(timeoutId);
            resolve({
                stdout:stdoutData,
                stderr: stderrData,
                exitCode: code || 0
            });
        });

        child.on('error', (error) => {
            clearTimeout(timeoutId);
            reject(error);
        });
    }).catch((error: any) => {
        if (error.message === 'Command timed out') {
            return null;
        }

        return {
            stdout: error.stdout,
            stderr: error.stderr,
            exitCode: error.code || 1
        };
    });
}

export function getExtensionContext(): vscode.ExtensionContext | undefined {
    return extensionContext;
}

export function setExtensionContext(context: vscode.ExtensionContext) {
    if (context) {
        extensionContext = context;
    } else {
        throw new Error("common.ts::setExtensionContext : Extension context is underfined.");
    }
}