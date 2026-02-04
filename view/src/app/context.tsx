import React, { createContext, useEffect, useState, ReactNode, use } from "react";
import * as intf from '../../../intf/interface';
import * as elf from '../core/elf';
import * as common from '../core/common'
// Declare the acquireVsCodeApi function.
declare function acquireVsCodeApi(): any;

const vscode = acquireVsCodeApi();

export interface ElfState {
  program: string,
  size: number,
  interpreter: string,
  elfHeader: elf.ElfHeader,
  programHeaders: elf.ProgramHeader[],
  sectionHeaders: elf.SectionHeader[]
}

const responseHandler = new common.ResposeHandler();

// Create the context with default null data
export const ElfStateContext = createContext<ElfState | null>(null);


interface DataProviderProps {

  children: React.ReactNode;
}

export const ElfStateProvider = ({ children }: DataProviderProps) => {
  const [state, setElfState] = useState<ElfState | null>(null);

  useEffect(() => {
    // Add event listener for received messages
    const messageEventListener = (event: MessageEvent) => {
      const message = event.data as intf.Response;
      responseHandler.handleResponse(message);
    };

    window.addEventListener('message', messageEventListener);

    // Send init message.
    responseHandler.registerHandler("init", (data: string) => {
      try {
        console.log(`Program : ${data}`);
        let state: common.State = {} as common.State;
        state.program = data;
        common.setStatePartial(vscode, state);
        const currentState = vscode.getState();
        setElfState(state)
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

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("message", messageEventListener);
    };
  }, []);

  return <ElfStateContext.Provider value={state}>{children}</ElfStateContext.Provider>;
};


