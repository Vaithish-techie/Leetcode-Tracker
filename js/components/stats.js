// Stats / User Profile Component
window.initStatsTab = function() {
  document.getElementById('lcUsername').value = usernames.leetcode || '';
  document.getElementById('gfgUsername').value = usernames.gfg || '';
  document.getElementById('loadStatsBtn').onclick = loadLiveStats;
  if (usernames.leetcode || usernames.gfg) {
    if (!statsCache.leetcode && !statsCache.gfg) loadLiveStats();
    else renderStats();
  }
  renderBadges();
};

async function loadLiveStats() {
  const lc = document.getElementById('lcUsername').value.trim();
  const gfg = document.getElementById('gfgUsername').value.trim();
  usernames = { leetcode:lc, gfg };
  await storeSet('pd_usernames_v1', usernames);
  
  const root = document.getElementById('statsContent');
  root.innerHTML = '<div class="loading-line">Fetching latest profiles...</div>';
  
  if (lc) {
    try {
      // Try multiple APIs in order of reliability
      let fetched = false;
      
      // API 1: leetcode-stats-api.herokuapp.com (most reliable)
      try {
        const r1 = await fetch(`https://leetcode-stats-api.herokuapp.com/${lc}`, { signal: AbortSignal.timeout(5000) });
        if (r1.ok) {
          const d1 = await r1.json();
          if (d1.status === 'success' || d1.totalSolved !== undefined) {
            statsCache.leetcode = {
              solvedProblem: d1.totalSolved || 0,
              easySolved: d1.easySolved || 0,
              mediumSolved: d1.mediumSolved || 0,
              hardSolved: d1.hardSolved || 0,
              totalProblems: d1.totalQuestions || 3000,
              totalEasy: d1.totalEasy || 800,
              totalMedium: d1.totalMedium || 1600,
              totalHard: d1.totalHard || 600,
              ranking: d1.ranking || 0,
              contributionPoints: d1.contributionPoints || 0,
              reputation: d1.reputation || 0,
            };
            fetched = true;
          }
        }
      } catch(e1) {}
      
      // API 2: alfaacademy proxy
      if (!fetched) {
        const r2 = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${lc}`, { signal: AbortSignal.timeout(5000) });
        if (r2.ok) {
          const d2 = await r2.json();
          statsCache.leetcode = {
            solvedProblem: d2.totalSolved || 0,
            easySolved: d2.easySolved || 0,
            mediumSolved: d2.mediumSolved || 0,
            hardSolved: d2.hardSolved || 0,
            totalProblems: d2.totalQuestions || 3000,
            totalEasy: d2.totalEasy || 800,
            totalMedium: d2.totalMedium || 1600,
            totalHard: d2.totalHard || 600,
            ranking: d2.ranking || 0,
          };
          fetched = true;
        }
      }
      
      // API 3: cn-api fallback
      if (!fetched) {
        const r3 = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${lc}`, { signal: AbortSignal.timeout(5000) });
        if (r3.ok) {
          const d3 = await r3.json();
          statsCache.leetcode = {
            solvedProblem: d3.totalSolved || 0,
            easySolved: d3.easySolved || 0,
            mediumSolved: d3.mediumSolved || 0,
            hardSolved: d3.hardSolved || 0,
            totalProblems: 3000, totalEasy: 800, totalMedium: 1600, totalHard: 600,
          };
        }
      }
      
    } catch(e) {
      console.warn('LeetCode stats fetch failed:', e.message);
      statsCache.leetcode = { solvedProblem: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, totalProblems: 3000, totalEasy:800, totalMedium:1600, totalHard:600 };
    }
    
    try {
      // Keep Alfa API just for scraping submission history (might be rate-limited)
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${lc}/acSubmission`);
      if (res.ok) {
        const acData = await res.json();
        const acList = Array.isArray(acData) ? acData : (acData.submission || []);
        
        let syncedCount = 0;
        acList.forEach(sub => {
          if(sub.titleSlug) {
            const pid = Object.keys(DATA.problems).find(k => DATA.problems[k][3] === sub.titleSlug);
            if (pid) {
              progress[pid] = progress[pid] || {};
              if (progress[pid].status !== 'solved') {
                progress[pid].status = 'solved';
                progress[pid].solvedAt = Date.now();
                syncedCount++;
              }
            }
          }
        });
        if (syncedCount > 0) {
          await storeSet('pd_progress_v1', progress);
          showToast(`Auto-synced ${syncedCount} new LeetCode solves! Streak updated. 🔥`);
          if(window.renderMotivStrip) window.renderMotivStrip();
        }
      }
    } catch(e) {}
  }
  if (gfg) {
    try {
      const res = await fetch(`https://geeks-for-geeks-api.vercel.app/${gfg}`);
      if (res.ok) {
        const json = await res.json();
        statsCache.gfg = json.info || json;
      }
    } catch(e) {
      statsCache.gfg = { totalProblemsSolved: 0 };
    }
  }
  renderStats();
}

function renderStats() {
  const root = document.getElementById('statsContent');
  const g = window.computeGamification();
  
  let html = `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:24px; margin-bottom:24px;">`;
  
  if (usernames.leetcode && statsCache.leetcode) {
    const s = statsCache.leetcode;
    if (s.solvedProblem) {
      html += `
      <div class="panel" style="padding:24px; background:linear-gradient(145deg, rgba(20,20,25,1) 0%, rgba(30,30,35,1) 100%); border:1px solid var(--border-strong); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-family:var(--font-mono); color:var(--ink-soft); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">LeetCode Profile</div>
            <div style="font-family:var(--font-display); font-size:22px; font-weight:700; color:var(--ink);">${esc(usernames.leetcode)}</div>
          </div>
          <div style="background:rgba(255,161,22,0.1); border:1px solid rgba(255,161,22,0.3); padding:8px 12px; border-radius:8px; text-align:center;">
            <div style="font-size:24px; font-weight:800; color:#ffa116; line-height:1; margin-bottom:4px;">${g.streak} <span style="font-size:16px;">🔥</span></div>
            <div style="font-size:10px; color:var(--ink-soft); text-transform:uppercase; font-weight:700;">Day Streak</div>
          </div>
        </div>
        
        <div style="display:flex; align-items:center; gap:32px; margin-top:32px;">
          <div style="position:relative; width:110px; height:110px;">
            <svg width="110" height="110" viewBox="0 0 120 120" style="transform:rotate(-90deg)">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--hard)" stroke-width="8" stroke-dasharray="314" stroke-dashoffset="${314 * (1 - (s.hardSolved/s.totalProblems))}" style="transition:1s cubic-bezier(0.4, 0, 0.2, 1)"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--medium)" stroke-width="8" stroke-dasharray="314" stroke-dashoffset="${314 * (1 - ((s.mediumSolved+s.hardSolved)/s.totalProblems))}" style="transition:1s cubic-bezier(0.4, 0, 0.2, 1)"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--easy)" stroke-width="8" stroke-dasharray="314" stroke-dashoffset="${314 * (1 - ((s.easySolved+s.mediumSolved+s.hardSolved)/s.totalProblems))}" style="transition:1s cubic-bezier(0.4, 0, 0.2, 1)"/>
            </svg>
            <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
              <div style="font-family:var(--font-display); font-size:26px; font-weight:800; color:var(--ink); line-height:1;">${s.solvedProblem}</div>
              <div style="font-size:10px; color:var(--ink-soft); margin-top:4px; text-transform:uppercase; letter-spacing:1px;">Solved</div>
            </div>
          </div>
          
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
              <span style="color:var(--easy); font-weight:600">Easy</span>
              <span style="color:var(--ink-soft)"><b style="color:var(--ink)">${s.easySolved||0}</b> / ${s.totalEasy||0}</span>
            </div>
            <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:4px; margin-bottom:12px; overflow:hidden;"><div style="height:100%; background:var(--easy); width:${Math.min(100,(s.easySolved/(s.totalEasy||1))*100)}%; border-radius:4px;"></div></div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
              <span style="color:var(--medium); font-weight:600">Medium</span>
              <span style="color:var(--ink-soft)"><b style="color:var(--ink)">${s.mediumSolved||0}</b> / ${s.totalMedium||0}</span>
            </div>
            <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:4px; margin-bottom:12px; overflow:hidden;"><div style="height:100%; background:var(--medium); width:${Math.min(100,(s.mediumSolved/(s.totalMedium||1))*100)}%; border-radius:4px;"></div></div>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
              <span style="color:var(--hard); font-weight:600">Hard</span>
              <span style="color:var(--ink-soft)"><b style="color:var(--ink)">${s.hardSolved||0}</b> / ${s.totalHard||0}</span>
            </div>
            <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden;"><div style="height:100%; background:var(--hard); width:${Math.min(100,(s.hardSolved/(s.totalHard||1))*100)}%; border-radius:4px;"></div></div>
          </div>
        </div>
      </div>`;
    }
  }
  
  if (usernames.gfg && statsCache.gfg) {
    const s = statsCache.gfg;
    if (s.totalProblemsSolved) {
      html += `<div class="panel" style="padding:24px; background:linear-gradient(145deg, rgba(20,20,25,1) 0%, rgba(30,30,35,1) 100%); border:1px solid var(--border-strong); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        <div style="font-family:var(--font-mono); color:var(--ink-soft); font-size:12px; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">GeeksforGeeks Profile</div>
        <div style="font-family:var(--font-display); font-size:22px; font-weight:700; color:var(--ink);">${esc(usernames.gfg)}</div>
        
        <div style="margin-top:24px;">
          <div style="font-family:var(--font-display); font-size:36px; font-weight:800; color:var(--ink); line-height:1;">${s.totalProblemsSolved} <span style="font-size:16px; color:var(--ink-soft); font-weight:500">solved</span></div>
        </div>
        
        <div style="margin-top:24px; display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:8px;">
            <span style="color:var(--ink-soft); font-size:14px;">Overall Rank</span>
            <span style="font-family:var(--font-mono); color:var(--ink); font-weight:700; font-size:16px;">${s.rank||'—'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:8px;">
            <span style="color:var(--ink-soft); font-size:14px;">Coding Score</span>
            <span style="font-family:var(--font-mono); color:var(--accent); font-weight:700; font-size:16px;">${s.codingScore||'—'}</span>
          </div>
        </div>
      </div>`;
    }
  }
  
  html += `</div>`;

  // Add JARVIS Motivational Block
  html += `
  <div class="panel" style="padding:24px; background:linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(0, 163, 255, 0.08)); border:1px solid rgba(0, 240, 255, 0.3); border-radius:16px; position:relative; overflow:hidden;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:14px; height:14px; border-radius:50%; background:#00F0FF; box-shadow:0 0 12px #00F0FF; animation: pulse 2s infinite;"></div>
        <div style="font-family:var(--font-display); font-size:18px; font-weight:700; color:#00F0FF; letter-spacing:1px;">J.A.R.V.I.S. MOTIVATIONAL UPLINK</div>
      </div>
      <button id="jarvisMotivateBtn" class="btn btn-primary" style="background:rgba(0, 240, 255, 0.15); color:#00F0FF; border:1px solid #00F0FF; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; transition:0.2s;">Ask JARVIS for Motivation</button>
    </div>
    <div id="jarvisMotivationConsole" style="font-family:var(--font-mono); font-size:15px; color:#E0E0FF; min-height:80px; padding:20px; background:rgba(0,0,0,0.6); border-radius:12px; border:1px solid rgba(0,240,255,0.2); line-height:1.7;">
      > Standing by to analyze your combat readiness for top-tier tech companies...
    </div>
  </div>`;
  
  root.innerHTML = html;

  // Bind JARVIS Motivation
  const motBtn = document.getElementById('jarvisMotivateBtn');
  if(motBtn) {
    motBtn.addEventListener('click', async () => {
      const con = document.getElementById('jarvisMotivationConsole');
      motBtn.disabled = true;
      motBtn.textContent = "Connecting...";
      con.innerHTML = "<span style='color:#00F0FF;'>[SYSTEM]</span> Initiating deep-dive into your stats...";
      
      try {
        const res = await fetch('/api/jarvis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'motivate' })
        });
        const data = await res.json();
        if(data.error) throw new Error(data.error);
        
        con.textContent = "";
        con.style.whiteSpace = 'pre-wrap';
        const text = data.text || '';
        let i = 0;
        function typeChar() {
          if (i < text.length) {
            con.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, 15);
          } else {
            motBtn.textContent = "Re-evaluate";
            motBtn.disabled = false;
          }
        }
        typeChar();
      } catch (err) {
        con.innerHTML = `<span style="color:#FF005C;">[ERROR] Failed to uplink. ${err.message}</span>`;
        motBtn.textContent = "Retry";
        motBtn.disabled = false;
      }
    });
  }
}

function renderBadges() {
  const host = document.getElementById('badgesHost');
  const g = window.computeGamification();
  const BADGES = [
    {id:'first', name:'First Blood', desc:'Solve your first problem', req:()=>g.totalSolved>=1, icon:'🩸'},
    {id:'streak3', name:'Warming Up', desc:'3 day solve streak', req:()=>g.streak>=3, icon:'🔥'},
    {id:'streak7', name:'Unstoppable', desc:'7 day solve streak', req:()=>g.streak>=7, icon:'⚡'},
    {id:'solve50', name:'Half Century', desc:'Solve 50 problems', req:()=>g.totalSolved>=50, icon:'5️⃣0️⃣'},
    {id:'solve100', name:'Century', desc:'Solve 100 problems', req:()=>g.totalSolved>=100, icon:'💯'},
    {id:'hard10', name:'Tough Guy', desc:'Solve 10 Hard problems', req:()=>{
      let h=0; Object.entries(progress).forEach(([pid,pr])=>{
        if(pr.status==='solved' && DATA.problems[pid] && DATA.problems[pid][1]==='H') h++;
      }); return h>=10;
    }, icon:'🏋️'},
    {id:'csf_all', name:'OS/DBMS Nerd', desc:'Check off all CS Fundamentals', req:()=>Object.keys(csfState).length>=CSF_TOPICS.length, icon:'🖥️'}
  ];
  
  host.innerHTML = `<div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:12px;">
    ${BADGES.map(b=>{
      const un = b.req();
      return `<div class="dash-card" style="width:240px; text-align:center; padding:24px 16px; border-color:${un?'var(--gold)':'var(--border)'}; opacity:${un?'1':'0.5'}; background:${un?'var(--bg-panel-2)':'var(--badge-lock)'}">
        <div style="font-size:36px; margin-bottom:8px; filter:${un?'none':'grayscale(1)'}">${b.icon}</div>
        <div style="font-family:var(--font-display); font-weight:700; font-size:15px; color:${un?'var(--ink)':'var(--ink-soft)'}">${b.name}</div>
        <div style="font-size:12.5px; color:var(--ink-faint); margin-top:4px;">${b.desc}</div>
      </div>`;
    }).join('')}
  </div>`;
}
