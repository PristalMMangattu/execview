import * as intf from '../../intf/interface';
import * as elf from './elf';
import * as common from './common';
import * as fileviz from './fileviz';
import * as viz from './viz';
//import "vscode-webview"

// Declare the acquireVsCodeApi function.
declare function acquireVsCodeApi(): any;

const vscode = acquireVsCodeApi();
const responseHandler = new common.ResposeHandler();
let gElf: elf.Elf;

// Get the canvas element and its 2D rendering context
// const element = document.getElementById('myCanvas');

const visualizer = new fileviz.ArrayVisualizer({
  containerSelector: '#visualization',
  numbers: [2, 85, 96, 500],
  boxWidth: 150,
  scaleFactor: 1,
  enableArrows: true,
  enableAnimations: true,
});


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

function initialize() {
  // Send init message.
  responseHandler.registerHandler("init", (data: string) => {
    console.log(`Program : ${data}`);
    let state: common.State = {} as common.State;
    state.program = data;
    common.setStatePartial(vscode, state);
    console.log('State in initialize:', vscode.getState());
    elf.getElf(vscode, data, responseHandler);
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
  // Replace paragraph with specific ID
  replaceParagraphById('readelf', 'This data should be provided by the extension.');
  initialize();

}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', main);


document.addEventListener('click', async (event: MouseEvent) => {
  const btn = event.target as HTMLButtonElement;
  if (btn.classList.contains('btn')) {
    const id = btn.id;
    const action = viz.actionMap[id];
    action?.();

  }
});


// Add event listener for received messages
const messageEventListener = (event: MessageEvent) => {
  const message = event.data as intf.Response;
  responseHandler.handleResponse(message);
};

window.addEventListener('message', messageEventListener);


