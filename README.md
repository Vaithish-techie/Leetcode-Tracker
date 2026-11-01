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

## Accounts and storage

The app now has sign-up, sign-in, logout, and session expiry. Passwords are never stored directly: the server stores a per-user salt and a `crypto.scrypt` password hash. Sessions are random HttpOnly cookies held by the server.

User data is stored separately in `db.json` under `users[userId].data`, for example:

```text
users/
  user_<random-id>/
    username
    passwordSalt
    passwordHash
    data/
      pd_progress_v1
      pd_patterns_v1
      pd_jobs_v1
      ...
```

The first account created automatically migrates the previous flat demo data, if it exists. `db.json` is ignored by Git because it contains private runtime data. For a larger deployment, replace it with SQLite or Postgres; the API boundary is already isolated in `server.js`.

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
- Environment variables: `GEMINI_API_KEY=...`, `HOST=0.0.0.0`, `COOKIE_SECURE=true`, and optionally `DATA_DIR=/opt/render/project/src/storage`
- Let the platform provide `PORT`; the server reads it automatically.

This is a small authenticated demo. Accounts are separated, but `db.json` is still a local file rather than a production database. On hosts with ephemeral storage, accounts and progress may reset after a restart; use a persistent disk or SQLite/Postgres for real deployment.

## Extension

`LC-Extension/` is an optional Chrome Manifest V3 companion. It reads the active coding-problem tab, lets you record a mistake, and sends it to the signed-in account through `/api/log-mistake`. Install instructions are in [`LC-Extension/README.md`](</home/vaiunix_111/College/DSA AND CP/LC/LC-tracker/LC-Extension/README.md:1>). The extension uses Chrome host permissions and does not require a per-user extension ID or CORS environment variable.

## Highlights

- Company explorer backed by 654 companies and 3,358 tagged problems
- Frequency, difficulty, topic, status, and company-overlap views
- Editable 25-pattern DSA reference library
- Mistake log with notes, code, confidence, and optional AI analysis
- Progress XP, streaks, heatmap, revision decay, CS/system-design checklists
- Live profile/contest integrations and a drag-and-drop job pipeline
