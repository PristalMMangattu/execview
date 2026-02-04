import { VscodeButton } from "@vscode-elements/react-elements";


export function Header() {
  const bstyle = {
    margin: "2px",
  }
  const hstyle = {
    fontSize: "1.5em",
    fontWeight: "bold",
  }
  return (
    <header>
      <h1>
        <span className="enlarged" style={hstyle}>E</span>xecutable &amp; <span className="enlarged" style={hstyle}>L</span>inkable <span className="enlarged" style={hstyle}>F</span>ormat
      </h1>
      <nav className="navigation">
        <VscodeButton className="btn" id="Overview" style={bstyle}>📁 Overview</VscodeButton>
        <VscodeButton className="btn" id="Sections" style={bstyle}>📊 Sections</VscodeButton>
        <VscodeButton className="btn" id="Segments" style={bstyle}>⚙️ Segments</VscodeButton>
        <VscodeButton className="btn" id="Symbols" style={bstyle}>🔍 Symbols & Strings </VscodeButton>
      </nav>
    </header>
  )
}
