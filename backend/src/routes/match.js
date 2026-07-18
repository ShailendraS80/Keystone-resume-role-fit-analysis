import { Router } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { requireAuth } from "../middleware/auth.js";
import { pool } from "../db.js";
import { analyzeResumeMatch } from "../services/gemini.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are accepted"));
    }
    cb(null, true);
  },
});

// Accepts a PDF file upload, extracts its raw text, and returns it.
// The frontend then uses that text the same way as pasted/plain-text input.
router.post("/extract-pdf", requireAuth, (req, res) => {
  upload.single("resume")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Could not process the uploaded file" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file was uploaded" });
    }
    try {
      const data = await pdfParse(req.file.buffer);
      const text = (data.text || "").trim();
      if (text.length < 30) {
        return res.status(422).json({
          error: "Couldn't find readable text in that PDF. It may be a scanned image — try pasting the text directly instead.",
        });
      }
      res.json({ text });
    } catch (parseErr) {
      console.error(parseErr);
      res.status(422).json({ error: "Could not read that PDF. Try a different file or paste the text directly." });
    }
  });
});

router.post("/analyze", requireAuth, async (req, res) => {
  const { resumeText, jdText, jobTitle } = req.body;

  if (!resumeText || !jdText || resumeText.trim().length < 30 || jdText.trim().length < 30) {
    return res.status(400).json({ error: "Please provide both a resume and a job description of reasonable length" });
  }

  try {
    const result = await analyzeResumeMatch(resumeText, jdText);

    await pool.query(
      `INSERT INTO matches
        (user_id, job_title, match_score, summary, matched_skills, missing_skills, suggestions, resume_snippet, jd_snippet)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        req.userId,
        jobTitle || null,
        result.match_score,
        result.summary,
        JSON.stringify(result.matched_skills || []),
        JSON.stringify(result.missing_skills || []),
        JSON.stringify(result.suggestions || []),
        resumeText.slice(0, 500),
        jdText.slice(0, 500),
      ]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Could not analyze the match right now. Please try again." });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, job_title, match_score, summary, matched_skills, missing_skills, suggestions, created_at
       FROM matches
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load match history" });
  }
});

export default router;
