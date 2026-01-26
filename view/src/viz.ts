// This is a file which exposes the API for index.html
// This is the glue layer between *viz files and elf parsers.
import * as def from './define';
import * as fileviz from './fileviz';
import * as vizutil from './vizutils';
import * as common from './common';
import Konva from 'konva';

export const actionMap: Record<string, (vscode: any) => void> = {
  'Overview': showOverview,
  'Sections': showSections,
  'Segments': showSegments,
  'Symbols': showSymbols
};

let fileVisualizer: fileviz.FileOverview | undefined = undefined;

function elfStructureInfo(vscode: any): def.FileArea[] {
  // Generating info from elf header.
  let info: def.FileArea[] = [];
  const state = vscode.getState() as common.State;
  if (!state) {
    throw new Error("Couldnt get state.");
  }

  if (Object.keys(state.elfHeader).length === 0) {
    throw new Error("elfHeader is empty");
  }

  // Elf Header data.
  const elfHeaderFileArea = {
    name: "Elf Header",
    addr: 0,
    size: state.elfHeader.SizeEH
  } as def.FileArea;

  console.log(`Elf header file area :`, elfHeaderFileArea);
  info.push(elfHeaderFileArea);

  if (state.sectionHeaders.length === 0) {
    throw new Error("sectionHeaders is empty");
  }

  // Section Header Table
  const sectionHeaderFileArea = {
    name: "Section Header Table",
    addr: state.elfHeader.StartOfSH,
    size: state.elfHeader.SizeSH * state.elfHeader.NumOfSH
  } as def.FileArea;

  console.log(`Section header file area :`, sectionHeaderFileArea);
  info.push(sectionHeaderFileArea);

  for (const sect of state.sectionHeaders) {
    const sectArea = {
      name: sect.Name,
      addr: sect.Offset,
      size: sect.Size
    } as def.FileArea;

    info.push(sectArea);
  }

  // Program Header Table
  if (state.programHeaders.length === 0) {
    throw new Error("programHeaders is empty");
  }

  const programHeaderFileArea = {
    name: "Program Header Table",
    addr: state.elfHeader.StartOfPH,
    size: state.elfHeader.SizePH * state.elfHeader.NumOfPH
  } as def.FileArea;

  console.log(`Program header file area :`, programHeaderFileArea);
  info.push(programHeaderFileArea);

  // Sort the info based on addr.
  info.sort((first, second) => first.addr - second.addr);


  // TODO: Insert void area for space which are not part of any valid elf area.
  return info;
}

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

  const width = container.clientWidth || def.KONVA_STAGE_WIDTH;
  const height = container.clientHeight || def.KONVA_STAGE_HEIGHT;
  console.log("Konva width", width);
  console.log("Konva height", height);

  let stage = new Konva.Stage({
    container: containerString,
    width,
    height,
  });

  const info = elfStructureInfo(vscode);
  fileVisualizer = new fileviz.FileOverview(stage, info);
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
