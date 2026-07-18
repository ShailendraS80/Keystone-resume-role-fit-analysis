# Keystone

A resume that's 90% right for a job is still a rejection. Keystone tells you what the missing 10% actually is — the one skill, keyword, or line item standing between your resume and the role you're applying for.

Paste a resume and a job description (or upload the resume as a PDF), and it gives you a match score, what's already lining up, what's missing, and a short list of fixes ranked by how much they'd actually move the needle.

I built this to get real practice with a full stack I hadn't used together before — Express + Postgres on the backend, a from-scratch React frontend, and an actual AI integration that does something a plain wrapper around a chatbot wouldn't do.

## Live demo

**[keystone-resume-role-fit-analysis.vercel.app](https://keystone-resume-role-fit-analysis.vercel.app)**

Sign up with any email, hit **Load a sample** to try it instantly, or upload your own resume as a PDF.

The backend runs on Render's free tier, which spins down after inactivity — so the very first request after a quiet period can take 30-50 seconds to wake back up. Give it a moment on that first load.

## Screenshots

**Sign in**

![Login screen](./docs/screenshots/login.png)

**Starting a new analysis** — paste text or upload a PDF resume directly

![Empty state with resume and job description panels](./docs/screenshots/home.png)

**Results** — score, matched/missing skills, and ranked suggestions

![Match results with score dial and suggestions](./docs/screenshots/results.png)

**Match history** — every analysis is saved per user

![Recent matches list](./docs/screenshots/history.png)

## What it does

- Compares a resume against a job description and returns a 0–100 match score
- Splits out skills you already have vs. ones the role wants that are missing from your resume
- Gives 3–5 concrete suggestions, ordered by impact, not just a generic checklist
- Lets you upload a resume as a PDF directly — the backend extracts the text, no copy-pasting required
- Saves every analysis you run so you can compare across different job postings you're applying to
- Runs on Google's Gemini API, which has a genuinely free tier — no card needed to try this yourself

## How it's put together

It's a fairly standard three-tier setup: a React frontend, an Express API, and Postgres for storage. The frontend never talks to Gemini directly — every analysis request goes through the backend first, gets authenticated, then the backend calls Gemini and saves the result. That keeps the API key server-side, which matters more than it sounds like the first time you build something like this and accidentally ship a key in your frontend bundle.

```
React (Vite)  →  Express API  →  Google Gemini
                       ↓
                  PostgreSQL
```

PDF uploads work the same way — the file gets sent to the backend, `pdf-parse` pulls the raw text out of it, and that text gets handed back to the frontend to drop into the textarea, so you can still edit it before running the analysis.

## Project layout

```
keystone/
├── backend/
│   ├── src/
│   │   ├── routes/         auth.js, match.js (includes PDF extraction)
│   │   ├── middleware/     JWT auth check
│   │   ├── services/       gemini.js — the actual AI call
│   │   └── index.js        Express entry point
│   ├── schema.sql
│   └── scripts/migrate.js
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/         TuningDial, Waveform, InputPanel, Chip
│       │   ├── Auth.jsx
│       │   ├── Keystone.jsx    main app screen
│       │   └── HistoryList.jsx
│       ├── api.js          talks to the backend
│       └── theme.js        colors, fonts
│
└── docs/screenshots/
```

## Tech used

- **Frontend:** React 18, Vite, lucide-react for icons
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt, nothing fancier than that
- **AI:** Google Gemini API (`gemini-3.5-flash`)
- **File handling:** multer for the upload, pdf-parse for pulling text out of it

## Running it locally

The live demo above is the fastest way to see it working, but here's how to run it yourself.

You'll need Node 18+, a Postgres database (local install or a free one from [Neon](https://neon.tech)), and a free Gemini key from [aistudio.google.com](https://aistudio.google.com).

```bash
git clone https://github.com/<your-username>/keystone.git
cd keystone
```

**Backend:**

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/keystone
JWT_SECRET=any-long-random-string
GEMINI_API_KEY=your-key-from-aistudio.google.com
CORS_ORIGIN=http://localhost:5173
```

Then:

```bash
npm run migrate
npm run dev
```

**Frontend** (in a second terminal):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`, sign up, and hit **Load a sample** to try it without needing your own resume handy.

## API

Everything's under `/api`. The `/match` routes need an `Authorization: Bearer <token>` header from signing up or logging in first.

| Method | Route                | What it does                                    |
|--------|----------------------|--------------------------------------------------|
| POST   | `/auth/signup`       | Create an account                                |
| POST   | `/auth/login`        | Log in                                           |
| POST   | `/match/analyze`     | Analyze a resume against a job description       |
| POST   | `/match/extract-pdf` | Upload a PDF, get its raw text back              |
| GET    | `/match/history`     | Your last 50 analyses                            |

`POST /match/analyze` expects:

```json
{
  "resumeText": "...",
  "jdText": "...",
  "jobTitle": "Senior Frontend Engineer"
}
```

and returns something like:

```json
{
  "match_score": 78,
  "summary": "Strong overlap on core React skills; missing testing and CI/CD experience.",
  "matched_skills": ["React", "REST APIs", "Git"],
  "missing_skills": ["TypeScript", "Next.js", "Cypress"],
  "suggestions": [
    { "title": "Add testing experience", "detail": "Mention any unit or integration testing you've done, even informally." }
  ]
}
```

## Database

Two tables, kept intentionally simple:

```sql
users (id, email, password_hash, created_at)

matches (
  id, user_id, job_title, match_score, summary,
  matched_skills, missing_skills, suggestions,   -- stored as JSONB
  resume_snippet, jd_snippet, created_at
)
```

## A couple of things worth knowing

The match score currently comes straight from the LLM's own judgment in one call, alongside the summary and suggestions. It works, but a more rigorous version would compute the score separately using embedding similarity (more consistent, easier to explain) and use the LLM only for the qualitative suggestions — that's the next thing I'd actually build if I kept going on this.

Also, PDF text extraction doesn't work on scanned/image-based PDFs since there's no OCR step — if a resume was exported as an image rather than real text, you'll get an error asking you to paste the text instead.

## License

MIT — see [LICENSE](./LICENSE).
