import * as intf from '../../intf/interface'

export function getSectionHeader(vscode: any, program: string) {
    vscode.postMessage({ 
        id: "abc",
        type: intf.RequestType.EXECUTE,
        data : {
            prog: "readelf",
            args: ["-SW", `${program}`],
        }
    });
}