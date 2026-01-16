import * as intf from '../../intf/interface'


// Post command for getting elf header and setup up callback to be called on receiving the response.
export function getElfHeader(vscode: any, program: string) {
    vscode.postMessage({ 
        id: "abc",
        type: intf.RequestType.EXECUTE,
        data : {
            prog: "readelf",
            args: ["-h", `${program}`],
        }
    });
}
