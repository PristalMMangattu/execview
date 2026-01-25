// This is a file which exposes the API for index.html
// This is the glue layer between *viz files and elf parsers.
import * as def from './define'
import * as fileviz from './fileviz';
import * as common from './common'
import Konva from 'konva';

export const actionMap: Record<string, (vscode: any) => void> = {
  'Overview': showOverview,
  'Sections': showSections,
  'Segments': showSegments,
  'Symbols': showSymbols
};

let fileVisualizer: fileviz.ArrayVisualizer | undefined = undefined;


export async function showOverview(this: HTMLButtonElement, vscode: any): Promise<void> {
  console.log("showOverview is clicked");
  // Get the canvas element and its 2D rendering context
  // const element = document.getElementById('myCanvas');

  if (fileVisualizer) {
    return;
  }

  const containerString = "#visualization";
  // Initialize Konva stage
  const container = document.querySelector(containerString) as HTMLElement;
  if (!container) {
    throw new Error(`Container not found: visualization`);
  }

  const width = container.clientWidth || 1200;
  const height = container.clientHeight || 800;

  let stage = new Konva.Stage({
    container: containerString,
    width,
    height,
  });

  // Generating info from elf header.
  const state = vscode.getState() as common.State;
  if (!state) {
    throw new Error("Couldnt get state.");
  }

  if (Object.keys(state).length === 0) {
    throw new Error("State is empty");
  }
  let info: def.FileArea[] = [];


  // Elf Header data.
  info.push({
    name: "Elf Header",
    addr: 0,
    size: state.elfHeader.SizeEH
  });

  // Section Header Table
  info.push({
    name: "Section Header Table",
    addr: state.elfHeader.StartOfSH,
    size: state.elfHeader.SizeSH * state.elfHeader.NumOfSH
  })

  // Program Header Table
  info.push({
    name: "Program Header Table",
    addr: state.elfHeader.StartOfPH,
    size: state.elfHeader.SizePH * state.elfHeader.NumOfPH
  })


  fileVisualizer = new fileviz.ArrayVisualizer(stage, info);

  return;

}

export async function showSections(this: HTMLButtonElement): Promise<void> {
  console.log("showSections is clicked");
  return;

}

export async function showSegments(this: HTMLButtonElement): Promise<void> {
  console.log("showSegments is clicked");
  return;

}

export async function showSymbols(this: HTMLButtonElement): Promise<void> {
  console.log("showSymbols is clicked");
  return;

}
