import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { C, FONTS } from "../../theme.js";

export default function Chip({ text, positive, accent }) {
  const fg = positive ? accent?.fg ?? C.phosphor : C.amber;
  const bg = positive ? accent?.bg ?? C.phosphorDim : C.amberDim;
  const border = positive ? accent?.border ?? "rgba(110,231,183,0.3)" : "rgba(245,166,35,0.3)";

  return (
    <span
      className="chip-pop"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        borderRadius: 999,
        padding: "5px 12px",
        fontFamily: FONTS.mono,
        fontSize: 12.5,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      {positive ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {text}
    </span>
  );
}
