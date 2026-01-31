
declare namespace JSX {
  interface IntrinsicElements {
    'vscode-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      appearance?: 'primary' | 'secondary' | 'icon';
      disabled?: boolean;
      autofocus?: boolean;
    };
  }
}

export function Header() {
  return (
    <header>
      <h1>
        <span className="enlarged">E</span>xecutable &amp; <span class="enlarged">L</span>inkable <span class="enlarged">F</span>ormat
      </h1>
      <nav className="navigation">
        <vscode-button className="btn" id="Overview">📁 Overview</vscode-button>
        <vscode-button className="btn" id="Sections">📊 Sections</vscode-button>
        <vscode-button className="btn" id="Segments">⚙️ Segments</vscode-button>
        <vscode-button className="btn" id="Symbols">🔍 Symbols &amp Strings </vscode-button>
      </nav>
    </header>
  )
}
