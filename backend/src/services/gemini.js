/**
 * Calls the Google Gemini API (free tier, no credit card) to compare a resume
 * against a job description. Requires GEMINI_API_KEY to be set in the environment.
 * Get a free key at https://aistudio.google.com
 */
const GEMINI_MODEL = "gemini-3.5-flash";

export async function analyzeResumeMatch(resumeText, jdText) {
  const prompt = `You are a precise resume-to-job matching engine. Compare the resume against the job description and return ONLY valid JSON (no markdown fences, no commentary, no leading/trailing text) matching exactly this shape:

{
  "match_score": number between 0 and 100,
  "summary": "1-2 sentence plain, direct summary of the fit",
  "matched_skills": ["up to 8 short skills/keywords present in both the resume and job description"],
  "missing_skills": ["up to 8 short important skills/keywords the job description wants but the resume lacks or under-represents"],
  "suggestions": [{"title": "4-6 word action title", "detail": "1 concrete, specific sentence"}] with 3 to 5 items, ordered from most impactful to least impactful
}

RESUME:
"""${resumeText}"""

JOB DESCRIPTION:
"""${jdText}"""`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text).join("\n") || "";

  if (!text) {
    console.error("Gemini returned no text. Full response:", JSON.stringify(data, null, 2));
    throw new Error(`Gemini returned no usable text (finishReason: ${candidate?.finishReason || "unknown"})`);
  }

  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    console.error(`Gemini stopped early (finishReason: ${candidate.finishReason}). Raw text:`, text);
  }

  // Strip markdown fences, then strip any raw control characters (stray
  // newlines/tabs inside string values) that would make JSON.parse choke.
  const clean = text
    .replace(/```json|```/g, "")
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F]+/g, " ");

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error("Failed to parse Gemini response as JSON. Raw text was:\n", text);
    throw err;
  }
}
