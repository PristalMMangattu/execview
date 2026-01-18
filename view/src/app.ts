import * as intf from '../../intf/interface'
import * as elf from './elf'
import * as common from './common'
import { send } from 'node:process';
//import "vscode-webview"

// Declare the acquireVsCodeApi function.
declare function acquireVsCodeApi(): any;

const vscode = acquireVsCodeApi();
const responseHandler = new common.ResposeHandler();
let gElf: elf.Elf;

// Get the canvas element and its 2D rendering context
const element = document.getElementById('myCanvas');

if (element instanceof HTMLCanvasElement) {
    const ctx = element.getContext('2d');

    // Check if the canvas context is available
    if (ctx) {
        // Define the boxes with their colors and positions
        const boxes = [
            { color: 'red', y: 0 },
            { color: 'orange', y: 50 },
            { color: 'yellow', y: 100 },
            { color: 'green', y: 150 },
            { color: 'blue', y: 200 }
        ];

        const boxHeight = 50;
        const boxWidth = 200; // Matches canvas width

        // Iterate through the boxes and draw them
        boxes.forEach(box => {
            ctx.fillStyle = box.color;
            // draw a filled rectangle at (x, y) with specified width and height
            ctx.fillRect(0, box.y, boxWidth, boxHeight);
        });
    }
} else {
    console.error("Canvas context not supported in this browser.");
}

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

function sendInitMessage() {
    responseHandler.registerHandler("init", (data: string) => {
        console.log(`Program : ${data}`);
        vscode.setState({data : {}});
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
  sendInitMessage()
  
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', main);


// Add event listener for received messages
const messageEventListener = (event: MessageEvent) => {
    const message = event.data as intf.Response;
    responseHandler.handleResponse(message);
}

window.addEventListener('message', messageEventListener);


