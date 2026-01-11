// This is the interface between vscode extension and webview.
// Webview is run in a sandboxed environment and have no access to local file system.
// Webview takes help of extension to run local programs.

export interface Result {
    STDOUT: string,
    STDERR: string,
    EXIT_CODE: number
}

