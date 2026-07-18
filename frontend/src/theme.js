export const C = {
  bg: "#F4F6FB",
  bgSoft: "#F1F4FA",
  panel: "#FFFFFF",
  panelBorder: "#E1E7F2",
  panelBorderSoft: "#E9EEF7",
  paper: "#12172B",
  paperDim: "#5B6B85",
  paperFaint: "#94A3B8",

  phosphor: "#059669",
  phosphorDim: "rgba(5,150,105,0.10)",
  amber: "#D97706",
  amberDim: "rgba(217,119,6,0.10)",
  rose: "#E11D48",
  roseDim: "rgba(225,29,72,0.10)",

  blue: "#2563EB",
  blueDim: "rgba(37,99,235,0.10)",
  violet: "#7C3AED",
  violetDim: "rgba(124,58,237,0.10)",
  pink: "#DB2777",
  pinkDim: "rgba(219,39,119,0.10)",
  teal: "#0D9488",
  tealDim: "rgba(13,148,136,0.10)",
};

// cycling palette used for "matched skill" chips so results feel varied,
// not a single flat color repeated
export const ACCENTS = [
  { fg: C.phosphor, bg: C.phosphorDim, border: "rgba(5,150,105,0.25)" },
  { fg: C.blue, bg: C.blueDim, border: "rgba(37,99,235,0.25)" },
  { fg: C.violet, bg: C.violetDim, border: "rgba(124,58,237,0.25)" },
  { fg: C.teal, bg: C.tealDim, border: "rgba(13,148,136,0.25)" },
  { fg: C.pink, bg: C.pinkDim, border: "rgba(219,39,119,0.25)" },
];

export const GRADIENT = {
  primary: `linear-gradient(135deg, ${C.phosphor}, ${C.blue})`,
  primaryHover: `linear-gradient(135deg, ${C.teal}, ${C.violet})`,
  dial: [
    { offset: "0%", color: C.rose },
    { offset: "50%", color: C.amber },
    { offset: "100%", color: C.phosphor },
  ],
};

export const BTN_TEXT = "#FFFFFF";

export const FONTS = {
  display: '"Space Grotesk", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
  body: '"Inter", -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", "Menlo", monospace',
};

export function scoreColor(score) {
  if (score >= 75) return C.phosphor;
  if (score >= 50) return C.amber;
  return C.rose;
}

export function scoreLabel(score) {
  if (score >= 85) return "Strong fit";
  if (score >= 70) return "Good fit";
  if (score >= 50) return "Partial fit";
  return "Weak fit";
}
