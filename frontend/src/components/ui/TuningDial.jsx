import React, { useState, useEffect } from "react";
import { C, GRADIENT } from "../../theme.js";

export default function TuningDial({ score, animate }) {
  const r = 74;
  const circumference = 2 * Math.PI * r;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!animate) {
      setDisplay(score);
      return;
    }
    let raf;
    const start = performance.now();
    const duration = 1100;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score, animate]);

  const offset = circumference * (1 - display / 100);

  return (
    <div style={{ position: "relative", width: 180, height: 180 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {GRADIENT.dial.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} fill="none" stroke={C.panelBorderSoft} strokeWidth="10" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="url(#dialGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 0.4s ease", filter: "drop-shadow(0 2px 6px rgba(15,23,42,0.15))" }}
        />
        {Array.from({ length: 40 }).map((_, i) => {
          const angle = (i / 40) * 2 * Math.PI - Math.PI / 2;
          const inner = 62;
          const outer = 68;
          const x1 = 90 + inner * Math.cos(angle);
          const y1 = 90 + inner * Math.sin(angle);
          const x2 = 90 + outer * Math.cos(angle);
          const y2 = 90 + outer * Math.sin(angle);
          const lit = i / 40 <= display / 100;
          const hue = 350 - (i / 40) * 200; // rose -> amber -> green across the dial
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lit ? `hsl(${hue}, 75%, 60%)` : C.panelBorderSoft}
              strokeWidth="1.5"
              opacity={lit ? 0.65 : 0.5}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 40, fontWeight: 600, color: C.paper, letterSpacing: -1 }}>
          {display}
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: C.paperFaint, letterSpacing: 1 }}>
          / 100
        </div>
      </div>
    </div>
  );
}
