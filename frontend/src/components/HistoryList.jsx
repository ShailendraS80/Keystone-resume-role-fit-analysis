import React from "react";
import { C, FONTS, scoreColor } from "../theme.js";

export default function HistoryList({ items }) {
  if (!items?.length) return null;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 14, padding: 20 }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 600, marginBottom: 14, color: C.paper }}>
        Recent matches
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: C.bgSoft,
              borderRadius: 10,
              border: `1px solid ${C.panelBorderSoft}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, color: C.paper, fontWeight: 500 }}>{m.job_title || "Untitled role"}</div>
              <div style={{ fontSize: 11.5, color: C.paperFaint, fontFamily: FONTS.mono }}>
                {new Date(m.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 600, color: scoreColor(m.match_score) }}>
              {m.match_score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
