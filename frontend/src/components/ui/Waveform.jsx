import React, { useState, useEffect } from "react";
import { C } from "../../theme.js";

export default function Waveform({ scanning, settled }) {
  const bars = 48;
  const [heights, setHeights] = useState(Array.from({ length: bars }, () => 6));

  useEffect(() => {
    if (!scanning) return;
    const id = setInterval(() => {
      setHeights(Array.from({ length: bars }, () => 6 + Math.random() * 26));
    }, 90);
    return () => clearInterval(id);
  }, [scanning]);

  useEffect(() => {
    if (settled) {
      setHeights(Array.from({ length: bars }, (_, i) => 6 + 14 * Math.abs(Math.sin(i * 0.4))));
    }
  }, [settled]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 34, justifyContent: "center" }}>
      {heights.map((h, i) => {
        const hue = 150 + (i / bars) * 150; // teal -> blue -> violet sweep
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              background: scanning ? `hsl(${hue}, 80%, 65%)` : C.panelBorder,
              borderRadius: 2,
              transition: "height 0.12s ease, background 0.3s ease",
              opacity: scanning ? 0.9 : 0.5,
              boxShadow: scanning ? `0 0 6px hsla(${hue}, 80%, 65%, 0.5)` : "none",
            }}
          />
        );
      })}
    </div>
  );
}
