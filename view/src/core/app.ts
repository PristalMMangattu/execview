import * as intf from '../../../intf/interface';
import * as elf from './elf';
import * as common from './common';
import * as viz from './viz';
import * as def from './define';
//import "vscode-webview"

// Declare the acquireVsCodeApi function.
declare function acquireVsCodeApi(): any;

const vscode = acquireVsCodeApi();
const responseHandler = new common.ResposeHandler();
let gElf: elf.Elf;

// Function to replace paragraph content by ID
function replaceParagraphById(
  id: string,
  newContent: string
): boolean {
  const paragraph = document.getElementById(id) as HTMLParagraphElement | null;

  if (!paragraph) {
    console.error('No paragraph found with ID:', id);
    return false;
  }

  paragraph.textContent = newContent;
  console.log(`Paragraph "${id}" content replaced successfully`);
  return true;
}

function initialView(): void {
  const overviewBtn = document.getElementById('Overview') as HTMLButtonElement;
  overviewBtn.click();
}

function initialize() {
  // Send init message.
  responseHandler.registerHandler("init", (data: string) => {
    try {
      console.log(`Program : ${data}`);
      let state: common.State = {} as common.State;
      state.program = data;
      common.setStatePartial(vscode, state);
      const currentState = vscode.getState();
      console.log('State in initialize:', currentState);
      elf.getElf(vscode, data, responseHandler);
      common.getFileSize(vscode, data, responseHandler);
    } catch (error) {
      console.error('Error in init handler:', error);
      console.error('Stack:', (error as Error).stack);
    }
  });

  const msg = {
    id: "init",
    type: intf.RequestType.INIT,
    data: ""
  } as intf.Request;

  vscode.postMessage(msg);
}
// Usage examples
function main() {
  initialize();
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', main);


document.addEventListener('click', async (event: MouseEvent) => {
  const btn = event.target as HTMLButtonElement;
  if (btn.classList.contains('btn')) {
    const id = btn.id;
    const action = viz.actionMap[id];
    action?.(vscode);
  }
});

// Check if all the required data is received from webview to display the initial contents
const intervalId = setInterval(() => {
  console.log("Checking if data is received.");
  const state = vscode.getState() as common.State;
  if (state.elfHeader && state.programHeaders.length > 0 && state.sectionHeaders.length > 0) {
    initialView();
    clearInterval(intervalId);
  }
}, def.CHECK_STATE_INTERVAL);


// Add event listener for received messages
const messageEventListener = (event: MessageEvent) => {
  const message = event.data as intf.Response;
  responseHandler.handleResponse(message);
};

window.addEventListener('message', messageEventListener);


