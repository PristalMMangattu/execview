import React, { useContext, useState, useEffect } from "react";
import { ElfStateContext } from '../context';

const StackedBoxes = () => {
  const [viewportHeight, setViewportHeight] = useState(0);

  // Set height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      setViewportHeight(window.innerHeight);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const [clickedBox, setClickedBox] = useState<number | null>(null);
  const totalBoxes = 30; // Example: more than 10

  const handleClick = (boxNumber: number) => {
    setClickedBox(boxNumber);
    console.log(`Box ${boxNumber} clicked!`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: viewportHeight, // Full viewport height
        maxWidth: '300px',
        margin: '20px',
      }}
    >
      {/* Optional fixed header */}
      <div
        style={{
          backgroundColor: '#333',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          flexShrink: 0, // Prevent shrinking
        }}
      >
        Scrollable Boxes ({totalBoxes} total)
        {clickedBox && ` | Last: ${clickedBox}`}
      </div>

      {/* Scrollable container */}
      <div
        style={{
          flex: 1, // Fill remaining height
          overflowY: 'auto', // Vertical scroll only
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {Array.from({ length: totalBoxes }, (_, i) => i + 1).map((boxNumber) => (
          <div
            key={boxNumber}
            onClick={() => handleClick(boxNumber)}
            style={{
              height: '80px',
              backgroundColor: `hsl(${boxNumber * 20}, 70%, 50%)`, // Dynamic colors
              display: 'flex',
              border: '2px',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            Box {boxNumber}
          </div>
        ))}
      </div>
    </div>
  );
};

export function FileStructure() {
  const state = useContext(ElfStateContext);
  if (!state)
    return (
      <h1> Program : Loading </h1>
    )

  return (
    <>
      <h1>
      Program : {state.program}
      </h1>
      <StackedBoxes/>
    </>

  )
}
