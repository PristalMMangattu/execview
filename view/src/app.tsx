
import './style.css'
import './manpage.json'
import React from "react";
import { createRoot } from "react-dom/client";
import { PanelRoot } from "./app/components/Panel";
import { Header } from "./app/components/Header"

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container!);
  root.render(<Header />);
} else {
  console.error("Failed to find 'root' element.")
}
