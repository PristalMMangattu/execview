import * as vscode from 'vscode';
import * as winston from 'winston';
import { Logger } from 'winston';
import { OutputChannelTransport } from 'winston-transport-vscode';
import * as fs from 'fs';
import * as path from 'path';
import { log } from 'console';


let logger: Logger | undefined;
let isLoggerInitializing = false;

function getLogFileName(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const time = date.getTime();
    return `execview-${year}${month}${day}-${time}.log`;
}

export async function getLogger(): Promise<Logger> {
    if (logger) {
        console.log('Logger is already initialized.');
        return logger;
    }

    // Ensure that only one instance of logger is created, even if this function is called asynchronously.
    if (isLoggerInitializing) {
        while (isLoggerInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return logger!; // Non-null assertion, here logger is already initialized by first caller.
    }
    isLoggerInitializing = true; // Will be set by first caller. Subsequent calls will not reach this point and beyond.

    const config = vscode.workspace.getConfiguration('elfviz');
    console.log('Initializing logger...');
    const logDirectory = config.get<string>('logDir');

    if(!fs.existsSync(`${logDirectory}`)) {
        await fs.promises.mkdir(`${logDirectory}`, { recursive: true});
    }

    const outputChannel = vscode.window.createOutputChannel('Exec Viz');
    const logFile = path.join(`${logDirectory}`, getLogFileName());
    console.log('Log file : ${logFile}');
    const debugLevel = config.get<string>('logLevel');
    const logDir = config.get<string>('logDir');

    const transport = new OutputChannelTransport({
        outputChannel
    });

    logger = winston.createLogger({
        level: `${debugLevel}`,
        exitOnError: false,
        levels: winston.config.npm.levels,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}] : ${message}`;
            })
        ),
        transports: [
            new winston.transports.File({ filename: logFile }),
            transport
        ]
    });

    console.log('Logger initialized successfuly.');
    isLoggerInitializing = false;
    return logger;
}

export async function updateLoggerLevel(): Promise<void> {
    if (!logger) {
        console.log('Logger is not initialized, cannot update level.');
        return;
    }

    const config = vscode.workspace.getConfiguration('elfviz');
    const newLevel = config.get<string>('logLevel');

    if (newLevel) {
        logger.level = newLevel;
        logger.info(`Logger level updated to : ${newLevel}`);
    }
}