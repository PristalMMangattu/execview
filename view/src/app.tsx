
import './style.css'
import './manpage.json'
import { createRoot } from "react-dom/client";
import { PanelRoot } from "./app/components/Panel";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container!);
  root.render(<PanelRoot />);
} else {
  console.error("Failed to find 'root' element.")
}
