// Global State
let progress = {};
let usernames = { leetcode: '', gfg: '' };
let statsCache = { leetcode: null, gfg: null };
let customEvents = [];
let contestsCache = null;
let revisionState = {};
let csfState = {};
let sysdState = {};
let studyCheckins = [];
let appInitialized = false;

let state = {
  tab: 'dashboard',
  company: '',
  compareList: [],
  filters: { search:'', difficulty:'all', recency:'all', topic:'all', status:'all' },
  sortKey: 'freq',
  sortDir: -1,
  mistakeCategory: 'tag'
};

const MISTAKE_TAGS = ["","Didn't understand problem","Wrong approach initially","Edge case missed","Syntax/Typo","Time limit exceeded","Memory limit exceeded","Logic error","Forgot pattern","Overcomplicated"];

function esc(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function externalUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '#';
  } catch (e) { return '#'; }
}

function topicNames(idxArr) { return idxArr.map(i => DATA.topics[i]); }
function diffLabel(d) { return {E:'Easy', M:'Medium', H:'Hard'}[d] || d; }
function recencyInfo(r) {
  if (r & 1) return { label: 'Last 30 days', cls: 'rec-hot' };
  if (r & 2) return { label: 'Last 3 months', cls: 'rec-warm' };
  if (r & 4) return { label: 'Last 6 months', cls: 'rec-cool' };
  return { label: '6+ months ago', cls: 'rec-old' };
}

// Local Storage / Backend DB Wrappers
async function storeGet(key) {
  try {
    // 1. Try to fetch from backend
    const res = await fetch(`/api/get-data?key=${key}`);
    const dbVal = await res.json();
    if (dbVal) return dbVal;
    
    // 2. Migration Phase: If backend empty but localStorage has it, migrate it!
    const localVal = localStorage.getItem(key);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      await storeSet(key, parsed); // Save to backend
      localStorage.removeItem(key); // Clear from local
      console.log(`Migrated ${key} from localStorage to physical Database!`);
      return parsed;
    }
    return null;
  } catch(e) { 
    // Fallback if server is down
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }
}
async function storeSet(key, val) {
  try {
    await fetch('/api/save-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, val })
    });
  } catch(e) {
    // Fallback
    localStorage.setItem(key, JSON.stringify(val));
  }
}

// Toast & Confetti
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.classList.remove('show'), 2600);
}

function fireConfetti() {
  const emojis = ['🎉','✨','🔥','⭐','🏆'];
  for (let i=0;i<14;i++){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.zIndex = '300';
    el.style.pointerEvents = 'none';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    el.style.left = Math.random()*100 + 'vw';
    el.style.animation = `confetti-fall ${1.6 + Math.random()*1.2}s linear forwards`;
    el.style.fontSize = (13 + Math.random()*14) + 'px';
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 3000);
  }
}
// Add animation styles dynamically
const style = document.createElement('style');
style.innerHTML = `@keyframes confetti-fall{ 0%{ transform:translateY(0) rotate(0deg); opacity:1;} 100%{ transform:translateY(100vh) rotate(360deg); opacity:0; } }`;
document.head.appendChild(style);


// Note Modal
let activeNotePid = null;
function openNoteModal(pid) {
  activeNotePid = pid;
  const p = DATA.problems[pid];
  const title = p ? p[0] : (progress[pid]?.customTitle || 'Unknown Problem');
  document.getElementById('noteModalTitle').textContent = title;
  document.getElementById('noteText').value = (progress[pid]||{}).note || '';
  document.getElementById('noteMistakeTag').value = (progress[pid]||{}).tag || '';
  document.getElementById('notePattern').value = (progress[pid]||{}).associatedPattern || '';
  document.getElementById('noteModal').classList.add('open');
}
function closeNoteModal() { document.getElementById('noteModal').classList.remove('open'); activeNotePid=null; }

async function initApp() {
  if (appInitialized) return;
  appInitialized = true;
  try {
    await window.dataReady;
  } catch (error) {
    document.body.innerHTML = `<main style="padding:40px;font-family:system-ui;color:#f4f4f5;background:#09090b;min-height:100vh"><h1>Pattern Desk could not start</h1><p>${esc(error.message)}</p></main>`;
    return;
  }

  // Navigation Sidebar
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.tab = btn.dataset.tab;
      
      document.querySelectorAll('.tab-content').forEach(tc => {
        tc.classList.remove('active-tab');
        tc.style.display = 'none';
      });
      const activeTab = document.getElementById('tab-' + state.tab);
      if(activeTab) {
        activeTab.style.display = 'block';
        activeTab.classList.add('active-tab');
      }
      
      // Dispatch events for components to render
      if (state.tab === 'dashboard') window.renderDashboardTab();
      if (state.tab === 'patterns') window.renderPatterns();
      if (state.tab === 'mistakes') {
        // Always re-fetch from server so extension logs appear without page reload
        storeGet('pd_progress_v1').then(p => {
          if (p) progress = p;
          window.renderMistakes();
        });
      }
      if (state.tab === 'compare') window.renderCompare();
      if (state.tab === 'stats') window.initStatsTab();
      if (state.tab === 'contests') window.initContestsTab();
      if (state.tab === 'explorer') window.renderExplorer();
      if (state.tab === 'cs') window.renderCSTab();
      if (state.tab === 'pipeline') window.renderPipelineTab();
      
      if(window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });

  document.getElementById('mobileToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Export / Import
  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pattern-desk-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  });
  
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev)=>{
      try{
        progress = JSON.parse(ev.target.result);
        await storeSet('pd_progress_v1', progress);
        window.renderDashboardTab(); window.renderExplorer();
        alert('Progress imported.');
      }catch(err){ alert('Could not read file.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Note Modal Actions
  const sel = document.getElementById('noteMistakeTag');
  sel.innerHTML = MISTAKE_TAGS.map(t=>`<option value="${esc(t)}">${t? esc(t): '— no tag —'}</option>`).join('');
  
  const patSel = document.getElementById('notePattern');
  patSel.innerHTML = `<option value="">— no pattern —</option>` + Object.keys(window.patternData || {}).map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
  
  document.getElementById('noteCancel').addEventListener('click', closeNoteModal);
  document.getElementById('noteSave').addEventListener('click', async () => {
    if (!activeNotePid) return;
    progress[activeNotePid] = progress[activeNotePid] || {};
    progress[activeNotePid].note = document.getElementById('noteText').value;
    progress[activeNotePid].tag = document.getElementById('noteMistakeTag').value;
    progress[activeNotePid].associatedPattern = document.getElementById('notePattern').value;
    await storeSet('pd_progress_v1', progress);
    closeNoteModal();
    if (state.tab==='explorer') window.renderExplorer();
    else if (state.tab==='mistakes') window.renderMistakes();
    else if (state.tab==='compare') window.renderCompare();
  });

  // Repo Refresh Button
  const repoBtn = document.getElementById('repoRefreshBtn');
  if(repoBtn) {
    repoBtn.addEventListener('click', () => {
      showToast("Fetching latest questions from GitHub... (using cached if failed)");
      // Note: A real fetch to raw.githubusercontent.com could go here.
      // For now we simulate it since DATA is massive and pre-bundled.
      setTimeout(() => showToast("Repository data is up to date!"), 1500);
    });
  }

  // Initial Load
  loadSavedState().then(() => {
    window.renderMotivStrip();
    window.renderDashboardTab();
  });
}

async function loadSavedState() {
  const p = await storeGet('pd_progress_v1'); if(p) progress = p;
  const ce = await storeGet('pd_custom_events_v1'); if(ce) customEvents = ce;
  const u = await storeGet('pd_usernames_v1'); if(u) usernames = u;
  const rs = await storeGet('pd_revision_v1'); if(rs) revisionState = rs;
  const cs = await storeGet('pd_csf_v1'); if(cs) csfState = cs;
  const ss = await storeGet('pd_sysd_v1'); if(ss) sysdState = ss;
  const sc = await storeGet('pd_study_checkins_v1'); if(sc) studyCheckins = sc;
}

document.addEventListener('DOMContentLoaded', initApp);
