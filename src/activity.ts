// Handle Activity Bar Events.

import * as vscode from 'vscode';

export class MyDataProvider implements vscode.TreeDataProvider<string> {
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
