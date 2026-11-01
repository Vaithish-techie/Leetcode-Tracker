// popup.js — LC-Tracker Extension (Multi-pattern support)

// Change this to "http://localhost:8000" for local development.
const SERVER = "https://leetcode-tracker-ezr2.onrender.com";
let selectedPatterns = [];
let serverOk = false;
let authenticated = false;

async function apiFetch(path, options = {}) {
  const stored = await chrome.storage.local.get(["sessionToken"]);
  const headers = { ...(options.headers || {}) };
  if (options.body) headers["Content-Type"] = "application/json";
  if (stored.sessionToken)
    headers.Authorization = `Bearer ${stored.sessionToken}`;
  return fetch(`${SERVER}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
}

function cleanCode(s) {
  return (s || "")
    .replace(/\u00a0/g, " ")
    .replace(/\u2003/g, " ")
    .replace(/\u200b/g, "")
    .trim();
}

function diffLabel(d) {
  return d === "E" ? "Easy" : d === "H" ? "Hard" : "Medium";
}

function escHtml(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function updateSelectedDisplay() {
  const disp = document.getElementById("selectedPatternsDisplay");
  if (!selectedPatterns.length) {
    disp.innerHTML = "";
    return;
  }
  disp.innerHTML = selectedPatterns
    .map(
      (p) => `
    <span class="sel-pat-tag">
      ${escHtml(p)}
      <button data-pattern="${escHtml(p)}" title="Remove">×</button>
    </span>
  `,
    )
    .join("");
  disp.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pat = btn.dataset.pattern;
      selectedPatterns = selectedPatterns.filter((x) => x !== pat);
      // unmark chip
      document.querySelectorAll(".pattern-chip").forEach((c) => {
        if (c.dataset.pattern === pat) c.classList.remove("selected");
      });
      updateSelectedDisplay();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const dot = document.getElementById("dot");
  const serverStatus = document.getElementById("serverStatus");
  const saveBtn = document.getElementById("saveBtn");
  const footerNote = document.getElementById("footerNote");
  const authSection = document.getElementById("authSection");
  const authButton = document.getElementById("authButton");
  const authUsername = document.getElementById("authUsername");
  const authPassword = document.getElementById("authPassword");

  // Open dashboard
  document.getElementById("openBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: SERVER });
  });

  // Tag chips (single-select)
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      document.getElementById("pTag").value = chip.dataset.tag;
    });
  });

  async function loadPatterns() {
    try {
      const r = await apiFetch("/api/get-data?key=pd_patterns_v1");
      if (r.status === 401) throw new Error("Sign in required");
      if (!r.ok) throw new Error("Server error");
      const patterns = (await r.json()) || {};
      serverOk = true;
      dot.classList.add("live");
      serverStatus.textContent = "connected";

      // Build multi-select pattern chips
      const chipsContainer = document.getElementById("patternChips");
      const patternList = Object.keys(patterns).sort();

      if (patternList.length) {
        chipsContainer.innerHTML = "";
        patternList.forEach((p) => {
          const chip = document.createElement("div");
          chip.className = "pattern-chip";
          chip.dataset.pattern = p;
          chip.textContent = p;
          chip.addEventListener("click", () => {
            if (selectedPatterns.includes(p)) {
              selectedPatterns = selectedPatterns.filter((x) => x !== p);
              chip.classList.remove("selected");
            } else {
              selectedPatterns.push(p);
              chip.classList.add("selected");
            }
            updateSelectedDisplay();
          });
          chipsContainer.appendChild(chip);
        });
      } else {
        chipsContainer.innerHTML =
          '<span style="color:var(--muted); font-size:11px; font-family:JetBrains Mono,monospace;">No patterns found. Log some first.</span>';
      }

      footerNote.textContent = `${patternList.length} patterns loaded`;
    } catch (e) {
      serverStatus.textContent =
        e.message === "Sign in required"
          ? "sign in required"
          : "server unavailable";
      footerNote.textContent =
        e.message === "Sign in required"
          ? "sign in above"
          : "server not reachable";
      document.getElementById("patternChips").innerHTML =
        `<span style="color:var(--red); font-size:11px; font-family:JetBrains Mono,monospace;">${e.message}</span>`;
    }
  }

  // ── 1. Authenticate and connect to tracker server ──
  try {
    const r = await apiFetch("/api/auth/me");
    const session = await r.json();
    if (session.authenticated) {
      authenticated = true;
      authSection.style.display = "none";
      await loadPatterns();
    }
  } catch (e) {
    serverStatus.textContent = "server unavailable";
    footerNote.textContent = "start Pattern Desk first";
  }

  authButton.addEventListener("click", async () => {
    authButton.disabled = true;
    authButton.textContent = "Signing in...";
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: authUsername.value,
          password: authPassword.value,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign in failed");
      if (result.sessionToken)
        await chrome.storage.local.set({ sessionToken: result.sessionToken });
      authenticated = true;
      authSection.style.display = "none";
      await loadPatterns();
      if (document.getElementById("pTitle").value) saveBtn.disabled = false;
    } catch (e) {
      footerNote.textContent = e.message;
      authButton.disabled = false;
      authButton.textContent = "Sign in";
    }
  });

  // ── 2. Scrape current tab ──
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";
  const PLATFORMS = [
    { host: "leetcode.com", name: "LeetCode" },
    { host: "geeksforgeeks.org", name: "GFG" },
    { host: "codeforces.com", name: "Codeforces" },
    { host: "codechef.com", name: "CodeChef" },
    { host: "hackerrank.com", name: "HackerRank" },
    { host: "interviewbit.com", name: "InterviewBit" },
  ];
  const plat = PLATFORMS.find((p) => url.includes(p.host));
  const probSection = document.getElementById("problemSection");

  if (!plat) {
    probSection.innerHTML = `<div class="problem-name not-on-platform">Not on a coding platform</div>`;
    footerNote.textContent = "navigate to a problem page";
    return;
  }

  // Scrape
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: scrapeData,
      args: [url],
    },
    (results) => {
      if (!results || !results[0]?.result) {
        probSection.innerHTML = `<div class="problem-name not-on-platform">Could not detect problem</div>`;
        return;
      }

      const data = results[0].result;
      const code = cleanCode(data.code);

      document.getElementById("pTitle").value = data.title;
      document.getElementById("pUrl").value = data.url;
      document.getElementById("pDiff").value = data.diff;
      document.getElementById("pCode").value = code;

      const d = data.diff;
      probSection.innerHTML = `
      <div class="problem-name">${escHtml(data.title)}</div>
      <div class="problem-meta">
        <span class="badge badge-${d}">${diffLabel(d)}</span>
        <span class="badge badge-plat">${plat.name}</span>
        ${!code ? `<span class="badge badge-plat" style="color:#f59e0b;">no code captured</span>` : ""}
      </div>`;

      if (serverOk && authenticated) saveBtn.disabled = false;
    },
  );

  // ── 3. Save ──
  saveBtn.addEventListener("click", async () => {
    const title = document.getElementById("pTitle").value;
    if (!title) {
      footerNote.textContent = "navigate to a problem first";
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const payload = {
      title,
      url: document.getElementById("pUrl").value,
      difficulty: document.getElementById("pDiff").value || "M",
      tag: document.getElementById("pTag").value,
      // Save as array for multi-pattern support; single string kept for backward compat
      pattern:
        selectedPatterns.length === 1 ? selectedPatterns[0] : selectedPatterns,
      patterns: selectedPatterns, // explicit array field
      notes: document.getElementById("pNotes").value.trim(),
      code: cleanCode(document.getElementById("pCode").value),
      timestamp: Date.now(),
    };

    try {
      const res = await apiFetch("/api/log-mistake", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.status === 401) throw new Error("sign in to save logs");
      if (!res.ok) throw new Error("server error");
      saveBtn.textContent = "✓ Logged!";
      saveBtn.classList.add("ok");
      footerNote.textContent = `saved: ${title.slice(0, 28)}`;
      setTimeout(() => window.close(), 1200);
    } catch (e) {
      saveBtn.textContent = "✗ Failed";
      saveBtn.classList.add("err");
      footerNote.textContent = "check server is running";
      setTimeout(() => {
        saveBtn.textContent = "Log to Tracker";
        saveBtn.classList.remove("err");
        saveBtn.disabled = false;
      }, 2500);
    }
  });
});

// ── Runs in the tab's context ──
function scrapeData(tabUrl) {
  let title = "",
    diff = "M",
    code = "";
  const url = window.location.href.split("?")[0];
  const host = window.location.hostname;

  if (host.includes("leetcode.com")) {
    const titleEl = document.querySelector(
      '[data-cy="question-title"], .text-title-large a, h4.text-label-1, .problems-title',
    );
    title =
      titleEl?.textContent.trim() || document.title.split(" - ")[0].trim();

    const diffEl = document.querySelector(
      ".text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard, [diff]",
    );
    if (diffEl) {
      const t = diffEl.textContent.toLowerCase();
      if (t.includes("easy")) diff = "E";
      else if (t.includes("hard")) diff = "H";
    }

    const lines = document.querySelectorAll(".view-lines .view-line");
    if (lines.length > 2) {
      code = Array.from(lines)
        .map((l) => l.textContent)
        .join("\n");
    }
    if (!code || code.length < 5) {
      const ta = document.querySelector(".inputarea");
      if (ta) code = ta.value;
    }
  } else if (host.includes("geeksforgeeks.org")) {
    title =
      document
        .querySelector(".problems-title, h1.entry-title")
        ?.textContent.trim() || document.title.split("-")[0].trim();
    code = document.querySelector(".CodeMirror-code")?.innerText || "";
  } else if (host.includes("codeforces.com")) {
    title =
      document.querySelector(".problem-statement .title")?.textContent.trim() ||
      document.title.split("-")[0].trim();
    code = document.querySelector("pre#program-source-text")?.textContent || "";
  } else if (host.includes("codechef.com")) {
    title =
      document
        .querySelector("#problem-statement h2, .problem-name")
        ?.textContent.trim() || document.title.split("|")[0].trim();
    code =
      document.querySelector(".CodeMirror-code, .ace_content")?.innerText || "";
  } else if (host.includes("hackerrank.com")) {
    title =
      document.querySelector(".hr-challenge-name, h1")?.textContent.trim() ||
      document.title.split("-")[0].trim();
    code = document.querySelector(".CodeMirror-code")?.innerText || "";
  }

  if (!title) title = document.title.split("-")[0].trim();
  return { title, url, diff, code: code.trim() };
}
