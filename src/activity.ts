// Handle Activity Bar Events.
import * as vscode from 'vscode';
import * as intf from '../intf/interface';

export class SegmentDataProvider implements vscode.TreeDataProvider<string> {
  getTreeItem(element: string): vscode.TreeItem {
    return {
      label: element,
      collapsibleState: vscode.TreeItemCollapsibleState.None
    };
  }

  getChildren(): string[] {
    return ['Item 1', 'Item 2', 'Item 3'];
  }
}


export class SectionDataProvider implements vscode.TreeDataProvider<string> {
  private sections: string[];

  constructor(sects: string[]) {
    this.sections = sects;
  }

  getTreeItem(element: string): vscode.TreeItem {
    return {
      label: element,
      collapsibleState: vscode.TreeItemCollapsibleState.None
    };
  }

  getChildren(): string[] {
    return this.sections;
  }
}


export async function populateActivityBar(msg: intf.ActivityBar) {
      // Tree view provider is registered only after a file is opened.

      if (msg.header === intf.HeaderType.SECT) {
        const provider = new SectionDataProvider(msg.data);
        vscode.window.registerTreeDataProvider('section-view', provider);
      }
}