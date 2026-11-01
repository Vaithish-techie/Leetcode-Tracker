# Pattern Desk

Pattern Desk is a personal interview-preparation dashboard I built to turn scattered DSA practice into one feedback loop: choose a company, prioritize its repeated questions, track solves, record mistakes, revise patterns, monitor contests, and manage applications.

It is a deliberately small vanilla HTML/CSS/JavaScript application with a tiny Node.js backend. The question catalog is split into `data/topics.json`, `data/problems.json`, and `data/companies.json`; personal state is stored in `db.json`; Gemini is used only for optional JARVIS briefings, code analysis, and company-prep suggestions.

## Run locally

```bash
cp .env.example .env
# Put a newly generated Gemini API key in .env if you want the JARVIS features.
npm start
```

Open <http://localhost:8000>.

The server binds to `127.0.0.1` by default. The backend intentionally exposes only the frontend files and the small API routes it needs; `.env` and `db.json` are not public routes.

## Structure

```text
index.html              page shell and modals
css/style.css           visual theme and layout
js/app.js               shared state, navigation, storage
js/data-loader.js       loads the catalog before startup
js/components/          one feature module per dashboard section
data/                   static topics, problems, and company catalog
server.js               static server, persistence API, Gemini proxy
db.json                 local demo state
```

## Deploy as a demo

This project can run on Render, Railway, or any Node host:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `GEMINI_API_KEY=...` and `HOST=0.0.0.0`
- Let the platform provide `PORT`; the server reads it automatically.

This is a single-user/demo data model. A public deployment shares one `db.json` between visitors and does not provide accounts. That is intentional for this internship demo, not a production multi-user design. On hosts with ephemeral storage, progress may reset after a restart.

## Highlights

- Company explorer backed by 654 companies and 3,358 tagged problems
- Frequency, difficulty, topic, status, and company-overlap views
- Editable 25-pattern DSA reference library
- Mistake log with notes, code, confidence, and optional AI analysis
- Progress XP, streaks, heatmap, revision decay, CS/system-design checklists
- Live profile/contest integrations and a drag-and-drop job pipeline
