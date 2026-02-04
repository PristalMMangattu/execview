import React, { useContext } from "react";
import { ElfStateContext } from '../context';

export function FileStructure() {
  const state = useContext(ElfStateContext);
  if (!state)
    return (
      <h1> Program : Loading </h1>
    )

  return (
    <h1>
      Program : {state.program}
    </h1>
  )
}
