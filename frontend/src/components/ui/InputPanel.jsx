import React, { useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { C, FONTS } from "../../theme.js";

export default function InputPanel({ icon: Icon, label, hint, value, onChange, accept, onFile, loading, uploadLabel }) {
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onFile) {
      onFile(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.readAsText(file);
    }
    // allow re-selecting the same file name later
    e.target.value = "";
  };

  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.panelBorder}`,
        borderRadius: 14,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={16} color={C.phosphor} />
          <span style={{ fontFamily: FONTS.display, fontSize: 14, fontWeight: 600, color: C.paper, letterSpacing: 0.2 }}>
            {label}
          </span>
        </div>
        {accept && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: `1px solid ${C.panelBorder}`,
              color: C.paperDim,
              fontSize: 12,
              fontFamily: FONTS.body,
              padding: "5px 10px",
              borderRadius: 8,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? <Loader2 size={12} className="spin" /> : <Upload size={12} />}
            {loading ? "Reading PDF…" : uploadLabel || "Upload"}
          </button>
        )}
        {accept && <input ref={fileRef} type="file" accept={accept} onChange={handleFileChange} style={{ display: "none" }} />}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
        spellCheck={false}
        style={{
          background: C.bgSoft,
          border: `1px solid ${C.panelBorderSoft}`,
          borderRadius: 10,
          padding: 14,
          color: C.paper,
          fontFamily: FONTS.body,
          fontSize: 13.5,
          lineHeight: 1.6,
          resize: "vertical",
          minHeight: 220,
          outline: "none",
          flex: 1,
        }}
        onFocus={(e) => (e.target.style.borderColor = C.phosphor)}
        onBlur={(e) => (e.target.style.borderColor = C.panelBorderSoft)}
      />
      <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: C.paperFaint }}>
        {value.trim().split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
}
