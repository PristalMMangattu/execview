// Handle Activity Bar Events.
import * as vscode from 'vscode';
import * as intf from '../intf/interface';
import { getLogger} from './logger';
import { Logger } from 'winston';

let logger: Logger;

(async () => {
    logger = await getLogger();
})();


let segTreeProvider: SegmentDataProvider | undefined = undefined;
let secTreeProvider: SectionDataProvider | undefined = undefined;

export class SegmentDataProvider implements vscode.TreeDataProvider<string> {
  private onDidChangeTreeDataEventEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData?: vscode.Event< void > = this.onDidChangeTreeDataEventEmitter.event;
  private segments: string[] = [];

  getTreeItem(element: string): vscode.TreeItem {
    return {
      label: element,
      collapsibleState: vscode.TreeItemCollapsibleState.None
    };
  }

  getChildren(): string[] {
    return this.segments;
  }

  refresh(segs: string[]) {
    this.segments = segs;
    this.onDidChangeTreeDataEventEmitter.fire();
  }
}


export class SectionDataProvider implements vscode.TreeDataProvider<string> {
  private onDidChangeTreeDataEventEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData?: vscode.Event< void > = this.onDidChangeTreeDataEventEmitter.event;
  private sections: string[] = [];

  getTreeItem(element: string): vscode.TreeItem {
    return {
      label: element,
      collapsibleState: vscode.TreeItemCollapsibleState.None
    };
  }

  getChildren(): string[] {
    return this.sections;
  }

  refresh(sects: string[]) {
    this.sections = sects;
    this.onDidChangeTreeDataEventEmitter.fire();
  }
}


export async function populateActivityBar(msg: intf.ActivityBar) {
      // Tree view provider is registered only after a file is opened.
      if (!secTreeProvider) {
        secTreeProvider = new SectionDataProvider();
        vscode.window.registerTreeDataProvider('section-view', secTreeProvider);
      }

      if (!segTreeProvider) {
        segTreeProvider = new SegmentDataProvider();
        vscode.window.registerTreeDataProvider('segment-view', segTreeProvider);
      }

      if (msg.header === intf.HeaderType.SECT) {
        secTreeProvider.refresh(msg.data);
        logger.info(`Refereshed Section Activity Bar with '${msg.data}'`);
      } else if (msg.header === intf.HeaderType.PROG) {
        segTreeProvider.refresh(msg.data);
        logger.info(`Refereshed Segment Activity Bar with '${msg.data}'`);
      } else {
        logger.error(`Unknown request '${msg.header}' to populate activity bar.`);
      }
}