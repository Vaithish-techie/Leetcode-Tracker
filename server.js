const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Manually load .env if it exists so users don't need dotenv
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  });
} catch (e) {}

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '127.0.0.1';
const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_FILE = path.join(DATA_DIR, 'db.json');
const ENV_FILE = path.join(__dirname, '.env');
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map();
const loginAttempts = new Map();
const LEGACY_DATA_KEYS = [
  'pd_progress_v1', 'pd_patterns_v1', 'pd_usernames_v1',
  'pd_custom_events_v1', 'pd_revision_v1', 'pd_csf_v1',
  'pd_sysd_v1', 'pd_study_checkins_v1', 'pd_jobs_v1'
];
const ALLOWED_KEYS = new Set([
  'pd_progress_v1', 'pd_patterns_v1', 'pd_usernames_v1',
  'pd_custom_events_v1', 'pd_revision_v1', 'pd_csf_v1',
  'pd_sysd_v1', 'pd_study_checkins_v1', 'pd_jobs_v1'
]);
const PUBLIC_FILES = new Set([
  'index.html', 'css/style.css', 'js/data-loader.js', 'js/auth.js', 'js/app.js',
  'js/components/dashboard.js', 'js/components/explorer.js',
  'js/components/patterns.js', 'js/components/mistakes.js',
  'js/components/compare.js', 'js/components/stats.js',
  'js/components/calendar.js', 'js/components/cs.js',
  'js/components/pipeline.js', 'data/topics.json', 'data/problems.json',
  'data/companies.json'
]);

// Load ENV
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) process.env[match[1]] = match[2].trim();
  });
}

// Ensure DB exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json'
};

function sendJson(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

function readDb() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch (e) { return {}; }
}

function userStore(db) {
  if (!db.users || typeof db.users !== 'object' || Array.isArray(db.users)) db.users = {};
  return db.users;
}

function legacyData(db) {
  const data = {};
  for (const key of LEGACY_DATA_KEYS) {
    if (db[key] !== undefined) data[key] = db[key];
  }
  return data;
}

function consumeLegacyData(db) {
  const users = userStore(db);
  if (Object.keys(users).length > 0) return {};
  const data = legacyData(db);
  for (const key of LEGACY_DATA_KEYS) delete db[key];
  return data;
}

function writeDb(db) {
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

function readJsonBody(req, res, callback) {
  let body = '';
  let size = 0;
  let tooLarge = false;
  req.on('data', chunk => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) tooLarge = true;
    else body += chunk.toString();
  });
  req.on('error', () => sendJson(res, 400, { error: 'Request could not be read.' }));
  req.on('end', () => {
    if (tooLarge) return sendJson(res, 413, { error: 'Request body is too large.' });
    try { callback(JSON.parse(body || '{}')); }
    catch (e) { sendJson(res, 400, { error: 'Request body must be valid JSON.' }); }
  });
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) { return false; }
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function passwordsMatch(password, salt, expectedHash) {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => {
    const index = part.indexOf('=');
    return index < 0 ? [] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(pair => pair.length));
}

function requestSessionToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return parseCookies(req.headers.cookie).pd_session;
}

function setSessionCookie(res, token) {
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `pd_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'pd_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}

function currentUser(req) {
  const token = requestSessionToken(req);
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  const db = readDb();
  const user = userStore(db)[session.userId];
  return user ? { id: session.userId, username: user.username, record: user } : null;
}

function requireUser(req, res) {
  const user = currentUser(req);
  if (!user) {
    sendJson(res, 401, { error: 'Authentication required.' });
    return null;
  }
  return user;
}

function loginRateLimited(ip) {
  const now = Date.now();
  const recent = (loginAttempts.get(ip) || []).filter(time => now - time < 10 * 60 * 1000);
  loginAttempts.set(ip, recent);
  return recent.length >= 10;
}

function recordLoginAttempt(ip) {
  const attempts = loginAttempts.get(ip) || [];
  attempts.push(Date.now());
  loginAttempts.set(ip, attempts);
}

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  setSessionCookie(res, token);
  return token;
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  if (req.method === 'OPTIONS') {
    // Extension pages use host_permissions for cross-origin API access. The
    // server does not maintain an extension-ID allowlist.
    res.writeHead(204);
    return res.end();
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;

  // Authentication
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = currentUser(req);
    return sendJson(res, 200, user
      ? { authenticated: true, user: { id: user.id, username: user.username } }
      : { authenticated: false });
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = requestSessionToken(req);
    if (token) sessions.delete(token);
    clearSessionCookie(res);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    return readJsonBody(req, res, ({ username, password }) => {
      const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
      if (!/^[a-z0-9_.-]{3,32}$/.test(normalizedUsername)) {
        return sendJson(res, 400, { error: 'Username must be 3–32 characters: letters, numbers, dot, dash, or underscore.' });
      }
      if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
        return sendJson(res, 400, { error: 'Password must be 8–128 characters.' });
      }

      const db = readDb();
      const users = userStore(db);
      if (Object.values(users).some(user => user.username === normalizedUsername)) {
        return sendJson(res, 409, { error: 'That username is already registered.' });
      }

      const id = `user_${crypto.randomBytes(12).toString('hex')}`;
      const salt = crypto.randomBytes(16).toString('hex');
      const initialData = consumeLegacyData(db);
      users[id] = {
        username: normalizedUsername,
        passwordSalt: salt,
        passwordHash: hashPassword(password, salt),
        createdAt: new Date().toISOString(),
        data: initialData
      };

      try {
        writeDb(db);
        const token = createSession(res, id);
        sendJson(res, 201, {
          ok: true,
          user: { id, username: normalizedUsername },
          sessionToken: token
        });
      } catch (e) {
        sendJson(res, 500, { error: 'Could not create the account.' });
      }
    });
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const ip = req.socket.remoteAddress || 'unknown';
    if (loginRateLimited(ip)) return sendJson(res, 429, { error: 'Too many login attempts. Try again later.' });
    return readJsonBody(req, res, ({ username, password }) => {
      recordLoginAttempt(ip);
      const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
      const db = readDb();
      const user = Object.values(userStore(db)).find(item => item.username === normalizedUsername);
      if (!user || typeof password !== 'string' || !passwordsMatch(password, user.passwordSalt, user.passwordHash)) {
        return sendJson(res, 401, { error: 'Invalid username or password.' });
      }

      const userId = Object.keys(userStore(db)).find(id => userStore(db)[id] === user);
      const token = createSession(res, userId);
      sendJson(res, 200, {
        ok: true,
        user: { id: userId, username: user.username },
        sessionToken: token
      });
    });
  }

  // API: Get Data
  if (pathname === '/api/get-data' && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return;
    const key = requestUrl.searchParams.get('key');
    if (!ALLOWED_KEYS.has(key)) return sendJson(res, 400, { error: 'Unknown data key.' });
    return sendJson(res, 200, user.record.data?.[key] ?? null);
  }

  // API: Save Data
  if (pathname === '/api/save-data' && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return;
    return readJsonBody(req, res, ({ key, val }) => {
      if (!ALLOWED_KEYS.has(key)) return sendJson(res, 400, { error: 'Unknown data key.' });
      const db = readDb();
      const record = userStore(db)[user.id];
      if (!record) return sendJson(res, 401, { error: 'Session is no longer valid.' });
      record.data = record.data || {};
      record.data[key] = val;
      try { writeDb(db); sendJson(res, 200, { ok: true }); }
      catch (e) { sendJson(res, 500, { error: 'Could not save data.' }); }
    });
  }

  // API: Extension Log Mistake
  if (pathname === '/api/log-mistake' && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return;
    return readJsonBody(req, res, log => {
      if (typeof log.title !== 'string' || !log.title.trim() || log.title.length > 240) {
        return sendJson(res, 400, { error: 'A valid problem title is required.' });
      }
      if (log.url && !isHttpUrl(log.url)) return sendJson(res, 400, { error: 'Problem URL must use HTTP or HTTPS.' });
      const db = readDb();
      
      const record = userStore(db)[user.id];
      if (!record) return sendJson(res, 401, { error: 'Session is no longer valid.' });
      record.data = record.data || {};
      let progress = record.data['pd_progress_v1'] || {};
      let patternData = record.data['pd_patterns_v1'] || {};
      
      const getFakeId = (title) => "ext_" + title.toLowerCase().replace(/[^a-z0-9]/g, '');
      let pid = getFakeId(log.title);
      
      // Clean non-breaking spaces (\u00a0) from code captured via Monaco
      const cleanCode = (c) => (c || '').replace(/\u00a0/g, ' ').replace(/\u2003/g, ' ').replace(/\u200b/g, '');
      
      progress[pid] = progress[pid] || {};
      progress[pid].status = 'struggled'; // Must be 'struggled' to show in Mistake Log
      progress[pid].note = log.notes;
      progress[pid].tag = log.tag || 'Wrong approach initially';
      progress[pid].code = cleanCode(log.code);
      progress[pid].customTitle = log.title;
      progress[pid].customUrl = log.url;
      progress[pid].associatedPattern = log.patterns && log.patterns.length > 1 
        ? log.patterns           // store as array for multi-pattern
        : (log.pattern || '');   // backward compat single string
      progress[pid].difficulty = log.difficulty || 'M';
      progress[pid].confidence = log.confidence || 3;
      progress[pid].solveTime = log.solveTime || 0;
      progress[pid].timestamp = log.timestamp || Date.now();
      progress[pid].loggedAt = Date.now();
      record.data['pd_progress_v1'] = progress;

      // Register question in ALL selected patterns
      const patternsToAdd = log.patterns && log.patterns.length ? log.patterns : (log.pattern ? [log.pattern] : []);
      patternsToAdd.forEach(pat => {
        if (!patternData[pat]) {
          patternData[pat] = { mastery: 'New', boilerplate: '// Standard template for ' + pat, intuition: '', whenToUse: '', mistakes: '', questions: [] };
        }
        if (!patternData[pat].questions) patternData[pat].questions = [];
        const qExists = patternData[pat].questions.some(q => q.url === log.url);
        if (!qExists) patternData[pat].questions.push({ name: log.title, url: log.url });
      });
      if (patternsToAdd.length) record.data['pd_patterns_v1'] = patternData;

      try { writeDb(db); sendJson(res, 200, { ok: true, message: 'Logged successfully!' }); }
      catch (e) { sendJson(res, 500, { error: 'Could not save the mistake.' }); }
    });
  }

  // API: JARVIS LLM (Gemini)
  if (pathname === '/api/jarvis' && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return;
    return readJsonBody(req, res, ({ prompt, type, code, title }) => {
      const allowedTypes = new Set(['analyze_code', 'motivate', 'daily_briefing', 'custom']);
      if (!allowedTypes.has(type)) return sendJson(res, 400, { error: 'Unknown JARVIS request type.' });
      if (typeof prompt === 'string' && prompt.length > 4000) return sendJson(res, 400, { error: 'Prompt is too long.' });
      if (typeof code === 'string' && code.length > 20000) return sendJson(res, 400, { error: 'Code is too long.' });
      if (typeof title === 'string' && title.length > 240) return sendJson(res, 400, { error: 'Title is too long.' });
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return sendJson(res, 400, { error: 'Missing GEMINI_API_KEY in the environment.' });
      }
      
      const db = readDb();
      const userData = userStore(db)[user.id]?.data || {};
      let sysPrompt = "";

      if (type === 'analyze_code') {
        sysPrompt = `You are an expert algorithms engineer. Analyze this code for the problem "${title}". 
        CODE:
        ${code}
        
        Respond EXACTLY in this JSON format (no markdown blocks around it, pure valid JSON only):
        {
          "your_tc": "O(N)", 
          "your_sc": "O(N)",
          "optimal_tc": "O(1)",
          "optimal_sc": "O(1)",
          "current_approach": "Short name for the user's approach (e.g. Brute Force)",
          "suggested_approach": "Short name for optimal approach (e.g. Two Pointers)",
          "key_idea": "Find the partition point in two sorted arrays using binary search to locate the median.",
          "consider": "Can you adapt this partitioning logic to find the k-th smallest element in two sorted arrays?",
          "optimal_code": "..."
        }`;
      } else if (type === 'motivate') {
        sysPrompt = `You are JARVIS, an encouraging but fiercely analytical AI mentor. 
        Read the user's progress and stats from the DB. 
        Write a short, highly motivational 1-paragraph summary telling them how close they are to their dreams of cracking FAANG/top-tier companies. 
        Highlight their current streak and their top strengths. 
        Format as plain text, speaking directly to them like Tony Stark. Make it epic.`;
      } else if (type === 'daily_briefing') {
        // Build a rich briefing prompt with live DB data
        const db2 = userData;
        sysPrompt = `You are JARVIS from Iron Man — highly intelligent, brutally efficient, zero fluff.
        Analyze this user's DSA preparation data and give a DAILY BRIEFING.
        
        USER DATA: ${JSON.stringify(db2).substring(0, 12000)}
        
        OUTPUT RULES — follow exactly:
        - Exactly 3 bullet points starting with a dash (-)
        - Max 25 words per bullet
        - Line 1: Current streak + total solved + one stark observation
        - Line 2: Their single biggest weakness topic or mistake pattern
        - Line 3: ONE specific action to do today (e.g. solve 2 Binary Search Mediums)
        - No markdown, no asterisks, no headers — pure terminal text
        - Iron Man JARVIS tone: precise, confident, slightly sarcastic`;
      } else {
        sysPrompt = `You are JARVIS, a highly intelligent coding assistant embedded inside a DSA tracker application.
        Here is the user's current data: ${JSON.stringify(userData).substring(0, 50000)}
        Analyze their progress, mistakes, and patterns. Keep responses concise, brilliant, and formatted in plain text (no markdown unless necessary).`;
      }
      
      const payload = JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: sysPrompt + (type === 'analyze_code' ? "" : (type === 'daily_briefing' ? "" : "\\n\\n" + prompt)) }] }
        ]
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
      };

      const aiReq = https.request(options, (aiRes) => {
        let aiData = '';
        aiRes.on('data', chunk => aiData += chunk);
        aiRes.on('end', () => {
          try {
            const resp = JSON.parse(aiData);
            if (resp.error) {
              return sendJson(res, 502, { error: `Gemini API Error: ${resp.error.message}` });
            }
            if (!resp.candidates || !resp.candidates[0]) {
              return sendJson(res, 502, { error: 'Gemini API returned an empty response.' });
            }
            const text = resp.candidates[0].content.parts[0].text;
            sendJson(res, 200, { text });
          } catch(e) {
            sendJson(res, 502, { error: 'AI response could not be parsed.' });
          }
        });
      });
      
      aiReq.on('error', (e) => {
        sendJson(res, 502, { error: 'Could not connect to the AI provider.' });
      });
      aiReq.write(payload);
      aiReq.end();
    });
  }

  // Serve only the files the browser actually needs. Never expose .env, db.json,
  // source helpers, or arbitrary files from the project directory.
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  if (!PUBLIC_FILES.has(relativePath)) return res.writeHead(404).end('404 Not Found');
  const filePath = path.join(__dirname, relativePath);
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if(err.code == 'ENOENT') { res.writeHead(404); res.end('404 Not Found'); }
      else { res.writeHead(500); res.end('500 Server Error'); }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`LC-Tracker Server running at http://${HOST}:${PORT}/`);
});
