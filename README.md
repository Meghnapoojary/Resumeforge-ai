# ResumeForge — the AI resume builder

A complete, 100% free-stack AI resume builder: accounts, multiple resumes,
real AI writing tools, six templates with a theme customizer, a job
application tracker, public share links, and PDF/DOCX/JSON export. No
credit card required anywhere in the stack.

## The core flow
1. **Sign up** (free, just an email + password — no external auth keys needed)
2. **Drop in keywords** and/or **upload an existing resume** (PDF, DOCX, TXT, MD)
3. **Gemini writes a complete first draft** — summary, bullets, skills, all structured
4. **Fine-tune** with the AI tool suite, pick a template and accent color
5. **Export** to PDF/DOCX/JSON, share a public link, or save the job to your tracker

## Full feature list

### Accounts & data
- Email/password auth (NextAuth, JWT sessions, bcrypt-hashed passwords) — no OAuth keys required
- Multi-resume dashboard: create, rename (via title field), delete
- Every resume is private to its owner by default

### AI tools (all via the free Gemini API)
- **Keyword-to-resume generator** — the flagship "cakewalk" feature
- Per-bullet rewriter
- **Humanizer** — polished ↔ natural slider on the summary
- **Tone/level adjuster** — entry-level / mid / senior / executive
- **Grammar & clarity pass** — read-only list of issues + fixes, never silently overwrites your text
- **Quantify suggestions** — flags bullets that imply impact but lack a number, and asks the clarifying question
- ATS compatibility score (overall/formatting/content + issues)
- Job description matcher (keyword gaps + suggestions + match score)
- Cover letter generator
- LinkedIn "About" generator
- Interview question predictor

### Design
- **Six templates**: Editorial, Modern, Minimal, Header Band (colored top band + two-column body), Sidebar Photo (colored sidebar with photo + skill pills), Split Bold (two-tone split block with a bold divider)
- **Photo support**: upload a headshot in the builder (resized/compressed client-side to keep documents small); appears on every template that has a natural spot for it, and is embedded in PDF, DOCX, and JSON Resume exports
- **Theme customizer**: 6 accent color presets + comfortable/compact density, applied live to whichever template is active
- **Cool blue design system** throughout the app with a light/dark mode toggle

### Export & sharing
- PDF export (browser print — no paid rendering service)
- DOCX export (styled `.docx`, generated server-side, matches the template)
- JSON Resume export (open jsonresume.org schema)
- Public, view-only share links (`/r/<slug>`) you can toggle on/off per resume

### Application tracker
- Kanban-style board: Applied / Interviewing / Offer / Rejected
- "Save to tracker" directly from the job-match tool in the builder, carrying over the job description and generated cover letter
- Add applications manually and link them to any resume

### Version history
- Every save snapshots the previous state (last 20 kept)
- Browse and restore any earlier version from the builder's History panel

## Setup (all free)

### 1. Get a free Gemini API key
https://aistudio.google.com/app/apikey — create a key.

### 2. Get a free MongoDB Atlas cluster
https://www.mongodb.com/cloud/atlas/register → free M0 cluster → connection string (Database → Connect → Drivers).

### 3. Generate an auth secret
```bash
openssl rand -base64 32
```

### 4. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in `GEMINI_API_KEY`, `MONGODB_URI`, and `NEXTAUTH_SECRET`. Leave `NEXTAUTH_URL` as `http://localhost:3000` for local dev (change it to your deployed URL in production).

### 5. Install and run
```bash
npm install
npm run dev
```
Open http://localhost:3000, sign up, and try it.

## Project structure
```
app/
  page.tsx                          → landing page + keyword/upload input
  login/page.tsx                    → login/signup
  dashboard/page.tsx                → multi-resume management
  tracker/page.tsx                  → application tracker (kanban)
  builder/[id]/page.tsx             → editor + live preview + full AI tool suite
  r/[slug]/page.tsx                 → public, view-only resume page (no auth)
  api/generate/route.ts             → keywords -> AI draft -> saved (auth required)
  api/resumes/…                     → CRUD, export-docx, export-json, share
  api/applications/…                → tracker CRUD
  api/ai/route.ts                   → every AI tool action, in one place
  api/parse-upload/route.ts         → PDF/DOCX/TXT/MD -> plain text
  api/auth/…                        → NextAuth + signup
lib/
  gemini.ts                         → all Gemini calls (uses @google/genai + gemini-2.5-flash), one function per feature
  auth.ts                           → NextAuth config (Credentials + JWT)
  mongodb.ts                        → cached DB connection (fails fast on bad URI)
  models/{User,Resume,JobApplication}.ts
  parseUpload.ts, docxExport.ts, jsonResume.ts, resumeText.ts
components/
  templates/{EditorialTemplate,ModernTemplate,MinimalTemplate,HeaderBandTemplate,SidebarPhotoTemplate,SplitBoldTemplate,types}.tsx
  TemplateRenderer.tsx               → picks a template by id
  NavBar.tsx                         → auth state + dark mode toggle
```

## What's still reasonably left for later
Templates now number **6** with genuinely distinct layouts (single-column,
two dark-sidebar variants, colored header band, colored sidebar, split
two-tone block) rather than thin variations of the same idea. If you want
more, adding one is self-contained: drop a new file in
`components/templates/`, register it in `TemplateRenderer.tsx`.

Also not included, as genuinely separate features rather than part of "one
complete pass": OAuth login (Google/GitHub), resume import that pre-fills
the builder from a parsed PDF/DOCX (uploads currently feed the AI generator,
not a direct field-mapping importer), and multi-language support.

## Notes on the free tier
- Uses `gemini-2.5-flash` via the current `@google/genai` SDK (the older
  `@google/generative-ai` package and `gemini-1.5-*` models are both fully
  retired by Google — if you ever see a 404 "model not found" error, it
  means Google has moved the goalposts again; check
  https://ai.google.dev/gemini-api/docs/models for the current model name
  and swap the `MODEL` constant in `lib/gemini.ts`).
- Gemini's free tier has **rate limits** (requests/minute), not a spending cap.
- MongoDB Atlas M0 free tier caps at 512MB storage.
- Deploying to Vercel's free tier: add all four env vars in the dashboard,
  and set `NEXTAUTH_URL` to your production URL.

## Known dependency advisory (read before deploying publicly)
`npm audit` flags a handful of Next.js 14.2.x advisories (Server Actions
SSRF/DoS, cache confusion, a PostCSS XSS/path-traversal chain) whose only
fix is upgrading to Next.js 16, which changes how dynamic route params are
read (`params` becomes a Promise) across every API route and page in this
project. That's a real, testable migration, not a one-line bump — so rather
than silently apply it un-tested, this build stays on the latest **patched**
14.2.x (14.2.35) and flags it here. For a personal project or local use this
is low-risk; before deploying somewhere public-facing, plan an explicit
Next.js 16 migration pass (update every `{ params }` destructure to
`await params`, then re-test each route).
