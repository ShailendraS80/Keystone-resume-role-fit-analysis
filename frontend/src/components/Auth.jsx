import React, { useState } from "react";
import { Radio, Loader2 } from "lucide-react";
import { C, FONTS, GRADIENT } from "../theme.js";
import { login, signup } from "../api.js";

const inputStyle = {
  background: "#0E1626",
  border: "1px solid #1C2740",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#E9EEF7",
  fontSize: 14,
  outline: "none",
};

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = mode === "login" ? login : signup;
      const data = await fn(email, password);
      onAuthed(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONTS.body,
        padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 380,
          background: C.panel,
          border: `1px solid ${C.panelBorder}`,
          borderRadius: 16,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: C.phosphorDim,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(110,231,183,0.3)",
            }}
          >
            <Radio size={17} color={C.phosphor} />
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 700, color: C.paper, letterSpacing: 0.5 }}>
            KEYSTONE
          </div>
        </div>

        <div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 19, color: C.paper, margin: "0 0 4px" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ color: C.paperDim, fontSize: 13, margin: 0 }}>
            {mode === "login"
              ? "Sign in to see your match history."
              : "Save every match you run and track improvement over time."}
          </p>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: C.paperDim, fontFamily: FONTS.mono }}>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: C.paperDim, fontFamily: FONTS.mono }}>Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error && <div style={{ color: C.rose, fontSize: 13 }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: GRADIENT.primary,
            color: "#FFFFFF",
            border: "none",
            borderRadius: 10,
            padding: "12px 18px",
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? "wait" : "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.18)",
          }}
        >
          {loading && <Loader2 size={15} className="spin" />}
          {mode === "login" ? "Sign in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          style={{ background: "transparent", border: "none", color: C.paperDim, fontSize: 13, cursor: "pointer" }}
        >
          {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
