// This is the interface between vscode extension and webview.
// Webview is run in a sandboxed environment and have no access to local file system.
// Webview takes help of extension to run local programs.

export enum RequestType {
    INIT,
    EXECUTE,
}

export interface Command {
    prog: string,
    args: string[],
    env?: Record<string, string>
}

export interface Request {
    id: string,
    type: RequestType,
    data?: Command | string // This can be anything depending on request type.
}

export interface Response {
    id: string,
    out: Result | string // This can be anything depending on Request Type
}

export interface Result {
    STDOUT: string,
    STDERR: string,
    EXIT_CODE: number
}

// Following Interfaces are used to communicate to view about user selection from activity bar.
// This is to support updating view based on user selection is activity bar.
export enum HeaderType {
    ELF_HEADER,
    PROG_HEADER,
    SEC_HEADER
}

export interface ActivityBarSelection {
    HEADER: HeaderType,
    NAME: string
}



