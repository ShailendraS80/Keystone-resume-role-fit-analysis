import React, { useState, useRef, useEffect } from "react";
import { FileText, Briefcase, Sparkles, RotateCcw, ArrowRight, Loader2, Radio, LogOut, Check } from "lucide-react";
import { C, FONTS, GRADIENT, ACCENTS, scoreColor, scoreLabel } from "../theme.js";
import TuningDial from "./ui/TuningDial.jsx";
import Waveform from "./ui/Waveform.jsx";
import InputPanel from "./ui/InputPanel.jsx";
import Chip from "./ui/Chip.jsx";
import HistoryList from "./HistoryList.jsx";
import { analyzeMatch, getHistory, extractPdfText } from "../api.js";

const SAMPLE_RESUME = `Frontend developer with 3 years of experience building React applications.
- Built and maintained internal dashboards using React, Redux, and REST APIs
- Wrote unit tests with Jest, collaborated with backend team on API contracts
- Improved page load time by optimizing bundle size with code splitting
- Mentored 2 junior developers, ran weekly code reviews
- Tools: JavaScript, HTML/CSS, Git, Figma, Jira`;

const SAMPLE_JD = `We're hiring a Senior Frontend Engineer to join our platform team.

Requirements:
- 4+ years building production React/TypeScript applications
- Experience with Next.js and server-side rendering
- Strong understanding of testing (Jest, React Testing Library, Cypress)
- Familiarity with CI/CD pipelines and Docker
- Experience with GraphQL a plus
- Comfortable working in an Agile team, leading small feature initiatives`;

const SCAN_PHASES = ["Reading your resume", "Reading the job description", "Comparing signals", "Tuning the score"];

const ghostBtn = {
  display: "flex",
  alignItems: "center",
  background: "transparent",
  border: `1px solid ${C.panelBorder}`,
  color: C.paperDim,
  fontSize: 12.5,
  fontFamily: FONTS.body,
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
};

const jobTitleInput = {
  width: "100%",
  background: C.panel,
  border: `1px solid ${C.panelBorder}`,
  borderRadius: 10,
  padding: "10px 14px",
  color: C.paper,
  fontFamily: FONTS.body,
  fontSize: 13.5,
  outline: "none",
};

function BackgroundBlobs() {
  return (
    <>
      <div className="bg-blob" style={{ width: 420, height: 420, top: -120, left: -100, background: C.phosphor, animation: "floatBlob 14s ease-in-out infinite" }} />
      <div className="bg-blob" style={{ width: 380, height: 380, top: 200, right: -140, background: C.violet, animation: "floatBlob 18s ease-in-out infinite reverse" }} />
      <div className="bg-blob" style={{ width: 320, height: 320, bottom: -100, left: "40%", background: C.blue, animation: "floatBlob 16s ease-in-out infinite" }} />
    </>
  );
}

export default function Keystone({ email, onSignOut }) {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [status, setStatus] = useState("idle"); // idle | scanning | done | error
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [checkedSuggestions, setCheckedSuggestions] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const phaseInterval = useRef(null);

  useEffect(() => {
    getHistory().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    if (status === "scanning") {
      setPhase(0);
      phaseInterval.current = setInterval(() => {
        setPhase((p) => (p < SCAN_PHASES.length - 1 ? p + 1 : p));
      }, 850);
    } else {
      clearInterval(phaseInterval.current);
    }
    return () => clearInterval(phaseInterval.current);
  }, [status]);

  const canAnalyze = resume.trim().length > 30 && jd.trim().length > 30 && status !== "scanning" && !pdfLoading;

  const loadSample = () => {
    setResume(SAMPLE_RESUME);
    setJd(SAMPLE_JD);
    setJobTitle("Senior Frontend Engineer");
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError("");
    setCheckedSuggestions({});
  };

  const analyze = async () => {
    setStatus("scanning");
    setError("");
    setCheckedSuggestions({});
    try {
      const data = await analyzeMatch(resume, jd, jobTitle);
      setResult(data);
      setStatus("done");
      getHistory().then(setHistory).catch(() => {});
    } catch (err) {
      setError(err.message || "Something went wrong while analyzing. Please try again.");
      setStatus("error");
    }
  };

  const toggleSuggestion = (i) => {
    setCheckedSuggestions((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const handleResumeFile = async (file) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      const reader = new FileReader();
      reader.onload = () => setResume(String(reader.result));
      reader.readAsText(file);
      return;
    }
    setPdfLoading(true);
    setError("");
    try {
      const text = await extractPdfText(file);
      setResume(text);
    } catch (err) {
      setError(err.message || "Could not read that PDF. Try a different file or paste the text directly.");
    } finally {
      setPdfLoading(false);
    }
  };

  const scanning = status === "scanning";
  const done = status === "done" && result;
  const suggestionCount = result?.suggestions?.length || 0;
  const checkedCount = Object.values(checkedSuggestions).filter(Boolean).length;
  const progressPct = suggestionCount ? Math.round((checkedCount / suggestionCount) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONTS.body, padding: "36px 20px 60px", color: C.paper, position: "relative", overflow: "hidden" }}>
      <BackgroundBlobs />
      <div style={{ maxWidth: 980, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: GRADIENT.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(5,150,105,0.25)",
              }}
            >
              <Radio size={17} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>KEYSTONE</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: C.paperFaint, letterSpacing: 0.5 }}>
                resume × role fit analysis
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12.5, color: C.paperDim, fontFamily: FONTS.mono }}>{email}</span>
            <button onClick={loadSample} style={ghostBtn} className="card-hover">
              Load a sample
            </button>
            <button onClick={onSignOut} style={ghostBtn} className="card-hover">
              <LogOut size={13} style={{ marginRight: 6 }} />
              Sign out
            </button>
          </div>
        </div>

        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: "clamp(22px, 3.4vw, 30px)",
            fontWeight: 600,
            margin: "0 0 8px",
            lineHeight: 1.25,
            color: C.paper,
          }}
        >
          Find the piece your resume is missing for this role.
        </h1>
        <p style={{ color: C.paperDim, fontSize: 14.5, margin: "0 0 20px", maxWidth: 620 }}>
          Paste your resume and a job description. Keystone compares the two and shows you exactly where
          they align — and where they don't.
        </p>

        <input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Job title (optional, e.g. Senior Frontend Engineer)"
          style={{ ...jobTitleInput, marginBottom: 16 }}
        />

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 6 }}>
          <InputPanel
            icon={FileText}
            label="Your resume"
            hint="Paste your resume text here, or upload a PDF…"
            value={resume}
            onChange={setResume}
            accept=".pdf,.txt"
            onFile={handleResumeFile}
            loading={pdfLoading}
            uploadLabel="Upload PDF or .txt"
          />
          <InputPanel icon={Briefcase} label="The job description" hint="Paste the job description here…" value={jd} onChange={setJd} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, margin: "22px 0 36px" }}>
          <Waveform scanning={scanning} settled={done} />
          {!done ? (
            <button
              disabled={!canAnalyze}
              onClick={analyze}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: canAnalyze ? GRADIENT.primary : C.panelBorder,
                color: canAnalyze ? "#FFFFFF" : C.paperFaint,
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontFamily: FONTS.display,
                fontSize: 14,
                fontWeight: 600,
                cursor: canAnalyze ? "pointer" : "not-allowed",
                boxShadow: canAnalyze ? "0 4px 16px rgba(37,99,235,0.2)" : "none",
              }}
            >
              {scanning ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
              {scanning ? SCAN_PHASES[phase] : "Analyze match"}
              {!scanning && <ArrowRight size={15} />}
            </button>
          ) : (
            <button onClick={reset} style={ghostBtn} className="card-hover">
              <RotateCcw size={14} style={{ marginRight: 6 }} />
              Analyze another role
            </button>
          )}
          {status === "error" && <div style={{ color: C.rose, fontSize: 13, fontFamily: FONTS.mono }}>{error}</div>}
        </div>

        {done && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              className="card-hover"
              style={{
                background: C.panel,
                border: `1px solid ${C.panelBorder}`,
                borderRadius: 16,
                padding: 28,
                display: "flex",
                gap: 28,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <TuningDial score={result.match_score} animate />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    letterSpacing: 1,
                    color: scoreColor(result.match_score),
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  {scoreLabel(result.match_score)}
                </div>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: C.paper, margin: 0 }}>{result.summary}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div className="card-hover" style={{ flex: 1, minWidth: 260, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 600, marginBottom: 12, color: C.paper }}>
                  Skills you have
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.matched_skills?.length ? (
                    result.matched_skills.map((s, i) => (
                      <span key={i} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                        <Chip text={s} positive accent={ACCENTS[i % ACCENTS.length]} />
                      </span>
                    ))
                  ) : (
                    <span style={{ color: C.paperFaint, fontSize: 13 }}>No strong overlaps found.</span>
                  )}
                </div>
              </div>
              <div className="card-hover" style={{ flex: 1, minWidth: 260, background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 600, marginBottom: 12, color: C.paper }}>
                  Skills to add
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.missing_skills?.length ? (
                    result.missing_skills.map((s, i) => (
                      <span key={i} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                        <Chip text={s} />
                      </span>
                    ))
                  ) : (
                    <span style={{ color: C.paperFaint, fontSize: 13 }}>Nothing major missing.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="card-hover" style={{ background: C.panel, border: `1px solid ${C.panelBorder}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 600, color: C.paper }}>
                  Ways to improve your resume, ranked by impact
                </div>
                {suggestionCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 100, height: 6, borderRadius: 4, background: C.bgSoft, overflow: "hidden" }}>
                      <div
                        className="progress-fill"
                        style={{
                          height: "100%",
                          width: `${progressPct}%`,
                          background: GRADIENT.primary,
                          borderRadius: 4,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: C.paperFaint }}>
                      {checkedCount}/{suggestionCount}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.suggestions?.map((s, i) => {
                  const isChecked = !!checkedSuggestions[i];
                  const accent = ACCENTS[i % ACCENTS.length];
                  return (
                    <div
                      key={i}
                      className="stagger-item"
                      style={{ display: "flex", gap: 14, alignItems: "flex-start", animationDelay: `${i * 0.06}s` }}
                    >
                      <div
                        onClick={() => toggleSuggestion(i)}
                        className="suggestion-check"
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 12,
                          color: isChecked ? "#FFFFFF" : accent.fg,
                          background: isChecked ? GRADIENT.primary : accent.bg,
                          border: `1px solid ${accent.border}`,
                          borderRadius: 8,
                          width: 26,
                          height: 26,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                        title={isChecked ? "Mark as not done" : "Mark as done"}
                      >
                        {isChecked ? <Check size={14} /> : i + 1}
                      </div>
                      <div style={{ opacity: isChecked ? 0.5 : 1, transition: "opacity 0.2s ease" }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: C.paper,
                            marginBottom: 2,
                            textDecoration: isChecked ? "line-through" : "none",
                          }}
                        >
                          {s.title}
                        </div>
                        <div style={{ fontSize: 13.5, color: C.paperDim, lineHeight: 1.5 }}>{s.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <HistoryList items={history} />
        </div>
      </div>
    </div>
  );
}
