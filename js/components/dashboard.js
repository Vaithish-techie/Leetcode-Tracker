// Dashboard Component
const QUOTES = [
  "Every problem you solve today is a pattern you won't fumble in the interview.",
  "Consistency beats intensity. One problem a day still wins the year.",
  "Struggling on a problem means you're finally at the edge of your ability — that's where growth happens.",
  "You don't need to be fast. You need to be someone who doesn't quit mid-problem.",
  "The pattern you keep missing is exactly the one worth drilling next.",
  "Interviewers remember how you think out loud more than whether you got O(n) on try one.",
  "Ship the ugly solution first. Elegant comes on the second pass.",
];

const CSF_TOPICS = ["Time & space complexity (Big-O)","Arrays & Strings internals","Linked Lists / Stacks / Queues","Trees & Graphs fundamentals","Hashing & Hash tables","Recursion & Divide-and-Conquer","Sorting & Searching algorithms","OS: Processes vs Threads","OS: Memory management & paging","OS: Deadlocks & concurrency","DBMS: Normalization & keys","DBMS: Transactions & ACID","DBMS: Indexing & query plans","Computer Networks: OSI/TCP-IP","Computer Networks: HTTP/HTTPS/DNS","Computer Networks: TCP vs UDP","OOP principles (SOLID)","Compilers/interpreters basics"];
const SYSD_TOPICS = ["Scalability: vertical vs horizontal","Load balancing strategies","Caching (client, CDN, server, DB)","Database sharding & replication","SQL vs NoSQL trade-offs","CAP theorem & consistency models","Message queues & async processing","Rate limiting","API design (REST/GraphQL/gRPC)","Consistent hashing","Microservices vs monolith","CDN & edge delivery","Designing a URL shortener","Designing a chat system","Designing a news feed","Designing rate limiter / notification system"];

const STUDY_RESOURCES = {
  dsa: [
    { name:"NeetCode (YouTube + neetcode.io)", url:"https://neetcode.io/", rating:5, best:true, how:"Follow the <b>NeetCode 150</b> roadmap in pattern order. Watch a video only <i>after</i> attempting the problem for 20–25 min yourself — the struggle is what builds pattern recognition." },
    { name:"Striver's A2Z DSA Sheet", url:"https://takeuforward.org/", rating:4.5, how:"Best as a <b>structured syllabus</b> if you're starting from zero — it sequences topics so prerequisites always come first. Re-solve without looking a day later." },
    { name:"Blind 75 / Grind 169", url:"https://www.techinterviewhandbook.org/grind75", rating:4.5, how:"Use as your <b>final-stretch checklist</b> before interviews — a compact, curated set that maximizes topic coverage." },
    { name:"CP-Algorithms (Advanced)", url:"https://cp-algorithms.com/", rating:5, how:"The absolute bible for <b>competitive programming</b> maths and advanced graph algorithms. Use this when you hit hard DP or Tree problems." }
  ],
  csf: [
    { name:"CS50 (Harvard, free)", url:"https://cs50.harvard.edu/x/", rating:4.5, best:true, how:"The single best <b>breadth-first foundation</b> — covers memory, data structures, algorithms and networking with real problem sets." },
    { name:"OSTEP — Operating Systems", url:"https://pages.cs.wisc.edu/~remzi/OSTEP/", rating:4.5, how:"Read chapters on <b>virtualization, concurrency, and persistence</b> — that's the shape of most OS interview questions." },
    { name:"Gate Smashers (DBMS + Networks)", url:"https://www.youtube.com/@GateSmashers", rating:4, how:"Good for <b>quick, exam-style refreshers</b> on normalization, transactions, OSI layers." }
  ],
  sysd: [
    { name:"System Design Interview by Alex Xu", url:"https://www.amazon.com/", rating:5, best:true, how:"Work through it <b>chapter by chapter</b>. Draw the diagrams out yourself." },
    { name:"ByteByteGo", url:"https://bytebytego.com/", rating:4.5, how:"Great for <b>visual, up-to-date explanations</b> of real infra and new tech stacks." },
    { name:"Gaurav Sen (System Design Playlist)", url:"https://www.youtube.com/c/GauravSensei", rating:4.5, how:"Excellent free <b>video breakdowns</b> of microservices, load balancing, and scaling systems." }
  ]
};

function dayOfYear(d){ const start = new Date(d.getFullYear(),0,0); return Math.floor((d - start)/86400000); }
function todayISO(){ return new Date().toISOString().slice(0,10); }

window.computeGamification = function() {
  const solvedEntries = Object.entries(progress).filter(([pid,pr])=>pr.status==='solved' && pr.solvedAt);
  const xpMap = {E:10,M:20,H:30};
  let xp = 0;
  const dateSet = new Set();
  solvedEntries.forEach(([pid,pr])=>{
    const p = DATA.problems[pid];
    if (p) xp += xpMap[p[1]] || 15;
    dateSet.add(new Date(pr.solvedAt).toISOString().slice(0,10));
  });
  
  let streak = 0;
  let cursor = new Date();
  const hasToday = dateSet.has(cursor.toISOString().slice(0,10));
  if (!hasToday) cursor.setDate(cursor.getDate()-1);
  while (dateSet.has(cursor.toISOString().slice(0,10))){
    streak++;
    cursor.setDate(cursor.getDate()-1);
  }
  
  const totalSolved = solvedEntries.length;
  const level = Math.floor(Math.sqrt(xp/40)) + 1;
  const xpForLevel = (l)=> Math.pow(l-1,2)*40;
  const xpIntoLevel = xp - xpForLevel(level);
  const xpNeeded = xpForLevel(level+1) - xpForLevel(level);
  const RANKS = [ [1,'Novice'],[5,'Apprentice'],[10,'Grinder'],[16,'Pattern Spotter'], [23,'Problem Slayer'],[31,'Algorithm Ace'],[40,'DSA Veteran'], [50,'Interview Ready'],[65,'Pattern Master'],[80,'Grandmaster'] ];
  let rankTitle = RANKS[0][1];
  for (const [lvl,name] of RANKS){ if (level>=lvl) rankTitle = name; }
  return { xp, streak, totalSolved, level, xpIntoLevel, xpNeeded, rankTitle, dateSet };
};

window.renderMotivStrip = function() {
  const g = window.computeGamification();
  const quote = QUOTES[dayOfYear(new Date()) % QUOTES.length];
  const host = document.getElementById('motivStrip');
  if(!host) return;
  const pct = Math.max(4, Math.round(100*g.xpIntoLevel/Math.max(1,g.xpNeeded)));
  host.innerHTML = `
    <div class="motiv-item"><span class="streak-flame">🔥</span><div><div class="motiv-num">${g.streak}</div><div class="motiv-label">day streak</div></div></div>
    <div class="motiv-divider"></div>
    <div class="motiv-item"><div><div class="motiv-num">${g.totalSolved}</div><div class="motiv-label">solved</div></div></div>
    <div class="motiv-divider"></div>
    <div class="motiv-item">
      <div>
        <div style="display:flex; align-items:center; gap:8px;"><span class="motiv-num">Lv.${g.level}</span><span class="rank-pill">${esc(g.rankTitle)}</span></div>
        <div class="motiv-label">${g.xp} xp · ${g.xpNeeded - g.xpIntoLevel} to next level</div>
      </div>
      <div class="xp-track"><div class="xp-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="motiv-quote">"${esc(quote)}"</div>
  `;
};

window.renderDashboardTab = function() {
  renderDashProgress();
  renderLocalHeatmap();
  renderRevisionQueue();
  renderResources();
  initJarvis();
};

function initJarvis() {
  const bootBtn = document.getElementById('jarvisBootBtn');
  const consoleEl = document.getElementById('jarvisConsole');
  if (!bootBtn || bootBtn.dataset.bound) return;
  bootBtn.dataset.bound = "true";

  bootBtn.addEventListener('click', async () => {
    bootBtn.disabled = true;
    bootBtn.textContent = "Processing...";
    consoleEl.innerHTML = `<span style='color:var(--accent); font-weight:600;'>[JARVIS]</span> <span style='color:var(--ink-soft);'>Uplink established. Reading your stats...</span>`;
    
    try {
      const res = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'daily_briefing' })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Render with proper newline handling and terminal bullet style
      consoleEl.innerHTML = "";
      const rawText = data.text || "";
      // Split on newlines and render line by line with typing per line
      const lines = rawText.split('\n').filter(l => l.trim());
      let lineIdx = 0;
      
      function typeLine() {
        if (lineIdx >= lines.length) {
          bootBtn.textContent = "Refresh Briefing";
          bootBtn.disabled = false;
          return;
        }
        const line = lines[lineIdx];
        // Format bullet lines
        const isBullet = line.trim().startsWith('-');
        const lineEl = document.createElement('div');
        lineEl.style.cssText = `display:flex; gap:10px; padding: ${isBullet ? '6px 0' : '2px 0'}; ${lineIdx > 0 ? 'margin-top:4px;' : ''}`;
        if (isBullet) {
          const marker = document.createElement('span');
          marker.textContent = '›';
          marker.style.cssText = 'color:var(--accent); font-weight:700; margin-top:1px;';
          const text = document.createElement('span');
          text.textContent = line.replace(/^-\s*/, '');
          text.style.cssText = 'color:var(--ink); line-height:1.6;';
          lineEl.append(marker, text);
        } else {
          lineEl.textContent = line;
          lineEl.style.color = 'var(--ink-soft)';
        }
        consoleEl.appendChild(lineEl);
        lineIdx++;
        setTimeout(typeLine, 120);
      }
      typeLine();
      
    } catch (err) {
      consoleEl.innerHTML = `<span style="color:var(--hard);">[ERROR] ${err.message}. Is server running? Does .env have GEMINI_API_KEY?</span>`;
      bootBtn.textContent = "Retry";
      bootBtn.disabled = false;
    }
  });
}

function ringSVG(pct, color){
  const r = 26, c = 2*Math.PI*r;
  const offset = c * (1 - pct/100);
  return `<div class="dash-ring">
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--bg-input)" stroke-width="6"/>
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
    </svg>
    <div class="pct">${pct}%</div>
  </div>`;
}

function renderDashProgress() {
  const host = document.getElementById('dashProgressGrid');
  if (!host) return;
  const g = window.computeGamification();
  const csfDone = CSF_TOPICS.filter(t=>csfState[t]).length;
  const sysdDone = SYSD_TOPICS.filter(t=>sysdState[t]).length;
  const csfPct = Math.round(100*csfDone/CSF_TOPICS.length) || 0;
  const sysdPct = Math.round(100*sysdDone/SYSD_TOPICS.length) || 0;
  const dsaPct = Math.min(100, Math.round(100*g.totalSolved/300));

  // Compute Difficulty Breakdown
  let easy = 0, med = 0, hard = 0;
  Object.keys(progress).forEach(pid => {
    if (progress[pid].status === 'solved' && DATA.problems[pid]) {
      const diff = DATA.problems[pid][1];
      if (diff === 'E') easy++;
      else if (diff === 'M') med++;
      else if (diff === 'H') hard++;
    }
  });
  const total = easy + med + hard || 1;
  const ePct = (easy / total) * 100;
  const mPct = (med / total) * 100;
  const hPct = (hard / total) * 100;
  
  host.innerHTML = `
    <div class="dash-card dsa" style="grid-column: 1 / -1; display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div class="dash-card-title">🧩 DSA Progress</div>
          <div class="dash-stat-row" style="margin-top:8px;"><span>Problems solved</span><b>${g.totalSolved} / 300 goal</b></div>
          <div class="dash-stat-row"><span>Current streak</span><b>${g.streak} days 🔥</b></div>
        </div>
        ${ringSVG(dsaPct, 'var(--dsa-color)')}
      </div>
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <!-- Graph: Difficulty Breakdown -->
        <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:16px; border:1px solid rgba(255,255,255,0.05);">
          <div style="font-size:11px; color:var(--ink-soft); text-transform:uppercase; margin-bottom:12px; font-weight:700;">Difficulty Distribution</div>
          <div style="display:flex; height:12px; border-radius:6px; overflow:hidden; margin-bottom:12px;">
            <div style="width:${ePct}%; background:var(--easy); transition:1s;"></div>
            <div style="width:${mPct}%; background:var(--medium); transition:1s;"></div>
            <div style="width:${hPct}%; background:var(--hard); transition:1s;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:12px; font-family:var(--font-mono);">
            <span style="color:var(--easy);">Easy: ${easy}</span>
            <span style="color:var(--medium);">Medium: ${med}</span>
            <span style="color:var(--hard);">Hard: ${hard}</span>
          </div>
        </div>
        
        <!-- Graph: Top Patterns Mastered -->
        <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:16px; border:1px solid rgba(255,255,255,0.05);">
          <div style="font-size:11px; color:var(--ink-soft); text-transform:uppercase; margin-bottom:8px; font-weight:700;">Top Patterns Mastered</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${(() => {
              const topicCounts = {};
              Object.keys(progress).forEach(pid => {
                if (progress[pid].status === 'solved' && DATA.problems[pid]) {
                  const tIdx = DATA.problems[pid][2];
                  if (tIdx !== undefined && DATA.topics[tIdx]) {
                    topicCounts[DATA.topics[tIdx]] = (topicCounts[DATA.topics[tIdx]] || 0) + 1;
                  }
                }
              });
              const topTopics = Object.entries(topicCounts).sort((a,b)=>b[1]-a[1]).slice(0,3);
              const maxCount = topTopics[0] ? topTopics[0][1] : 1;
              return topTopics.length ? topTopics.map(([t, c]) => `
                <div style="display:flex; align-items:center; gap:8px;">
                  <div style="width:70px; font-size:10px; color:var(--ink-faint); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(t)}</div>
                  <div style="flex:1; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
                    <div style="height:100%; width:${(c/maxCount)*100}%; background:var(--accent); border-radius:3px;"></div>
                  </div>
                  <div style="font-size:10px; font-family:var(--font-mono); color:var(--accent);">${c}</div>
                </div>
              `).join('') : '<div style="font-size:12px; color:var(--ink-faint);">No patterns solved yet</div>';
            })()}
          </div>
        </div>
      </div>
    </div>
    <div class="dash-card csf" style="display:flex; flex-direction:column;">
      <div class="dash-card-head"><div class="dash-card-title">🧠 CS Fundamentals</div>${ringSVG(csfPct, 'var(--csf-color)')}</div>
      <div class="dash-stat-row" style="margin-bottom:12px;"><span>Topics covered</span><b>${csfDone} / ${CSF_TOPICS.length}</b></div>
      <div class="checklist-container" style="flex:1; overflow-y:auto; max-height:200px; padding-right:8px; border-top:1px solid var(--border-strong); padding-top:12px;">
        ${CSF_TOPICS.map((t, i) => `
          <label style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer; font-size:13px; color: ${csfState[t] ? 'var(--csf-color)' : 'var(--ink)'}; text-decoration: ${csfState[t] ? 'line-through' : 'none'};">
            <input type="checkbox" onchange="window.toggleChecklist('csf', '${esc(t).replace(/'/g,"\\'")}')" ${csfState[t] ? 'checked' : ''} style="accent-color:var(--csf-color); transform:scale(1.1);">
            ${esc(t)}
          </label>
        `).join('')}
      </div>
    </div>
    <div class="dash-card sysd" style="display:flex; flex-direction:column;">
      <div class="dash-card-head"><div class="dash-card-title">🏗️ System Design</div>${ringSVG(sysdPct, 'var(--sysd-color)')}</div>
      <div class="dash-stat-row" style="margin-bottom:12px;"><span>Topics covered</span><b>${sysdDone} / ${SYSD_TOPICS.length}</b></div>
      <div class="checklist-container" style="flex:1; overflow-y:auto; max-height:200px; padding-right:8px; border-top:1px solid var(--border-strong); padding-top:12px;">
        ${SYSD_TOPICS.map((t, i) => `
          <label style="display:flex; align-items:center; gap:8px; padding:6px 0; cursor:pointer; font-size:13px; color: ${sysdState[t] ? 'var(--sysd-color)' : 'var(--ink)'}; text-decoration: ${sysdState[t] ? 'line-through' : 'none'};">
            <input type="checkbox" onchange="window.toggleChecklist('sysd', '${esc(t).replace(/'/g,"\\'")}')" ${sysdState[t] ? 'checked' : ''} style="accent-color:var(--sysd-color); transform:scale(1.1);">
            ${esc(t)}
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function renderLocalHeatmap() {
  const host = document.getElementById('dashHeatmapHost');
  if (!host) return;
  const g = window.computeGamification();
  
  const days = [];
  const now = new Date();
  for (let i=364; i>=0; i--){
    const d = new Date(now); d.setDate(d.getDate()-i);
    days.push({date: d.toISOString().slice(0,10), obj: d});
  }
  
  let cells = '';
  let monthsHtml = '';
  let lastMonth = -1;
  
  days.forEach((day, index) => {
    const isSolved = g.dateSet.has(day.date);
    let cls = 'hm-cell';
    if(isSolved) cls += ' hm-4'; // glowing streak active
    
    // Add month labels
    if (day.obj.getDate() === 1 && day.obj.getMonth() !== lastMonth) {
      monthsHtml += `<span>${day.obj.toLocaleString('default', { month: 'short' })}</span>`;
      lastMonth = day.obj.getMonth();
    }
    
    cells += `<div class="${cls}" title="${day.date}: ${isSolved?'Solved!':'No activity'}"></div>`;
  });
  
  host.innerHTML = `
    <div class="streak-card">
      <div class="streak-card-head">
        <div class="streak-headline"><span class="streak-flame">🔥</span> <b>${g.streak}</b> day streak · <b>${g.totalSolved}</b> total solved</div>
      </div>
      <div class="heatmap-wrap">
        <div class="heatmap-months">${monthsHtml}</div>
        <div class="heatmap">${cells}</div>
      </div>
    </div>  `;
}

window.toggleChecklist = async function(type, topic) {
  if (type === 'csf') {
    csfState[topic] = !csfState[topic];
    await storeSet('pd_csf_v1', csfState);
  } else if (type === 'sysd') {
    sysdState[topic] = !sysdState[topic];
    await storeSet('pd_sysd_v1', sysdState);
  }
  renderDashProgress();
  if (window.renderMotivStrip) window.renderMotivStrip();
};

function renderResources() {
  const host = document.getElementById('resourcesHost');
  if (!host) return;
  host.innerHTML = `<div class="resource-grid">
    ${STUDY_RESOURCES.dsa.map(r => `<div class="resource-card ${r.best?'best':''}"><div class="resource-head"><div class="resource-name"><a href="${esc(r.url)}" target="_blank">${esc(r.name)}</a></div></div><div class="resource-howto">${r.how}</div></div>`).join('')}
  </div>`;
}

// ---- Revision Queue Logic ----
const REVISION_INTERVALS = [3,7,14,30,60];

function getRevisionTopics() {
  const globalFreq = {};
  Object.values(DATA.companies).forEach(companyList => {
    companyList.forEach(([pid, freq]) => {
      const tIdx = DATA.problems[pid][2];
      if (tIdx !== undefined && DATA.topics[tIdx]) {
        const topicName = DATA.topics[tIdx];
        if(!globalFreq[topicName]) globalFreq[topicName] = 0;
        globalFreq[topicName] += freq;
      }
    });
  });
  return Object.entries(globalFreq)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,12)
    .map(([name, count]) => ({name, count}));
}

function renderRevisionQueue() {
  const host = document.getElementById('revisionGrid');
  if (!host) return;
  
  // Calculate decay per pattern
  const patternStats = {};
  Object.keys(window.patternData || {}).forEach(p => {
    patternStats[p] = { solves: 0, lastSolve: 0, retention: 0 };
  });
  
  const now = Date.now();
  Object.values(progress).forEach(pr => {
    if (pr.status === 'solved' && pr.associatedPattern && patternStats[pr.associatedPattern]) {
      patternStats[pr.associatedPattern].solves++;
      const time = pr.solvedAt ? new Date(pr.solvedAt).getTime() : pr.timestamp || pr.loggedAt || 0;
      if (time > patternStats[pr.associatedPattern].lastSolve) {
        patternStats[pr.associatedPattern].lastSolve = time;
      }
    }
  });
  
  // Calculate retention using Ebbinghaus forgetting curve approximation
  // retention = e^(-days / strength)
  const decayItems = Object.entries(patternStats)
    .filter(([name, stat]) => stat.solves > 0)
    .map(([name, stat]) => {
      const daysSince = (now - stat.lastSolve) / (1000 * 60 * 60 * 24);
      // Base strength increases with more solves (up to a cap)
      const strength = Math.min(10, stat.solves * 2 + 2); 
      let retention = Math.round(Math.exp(-daysSince / strength) * 100);
      if (daysSince === 0) retention = 100; // Just in case
      return { name, stat, daysSince, retention };
    })
    .sort((a, b) => a.retention - b.retention); // Lowest retention first
    
  if (!decayItems.length) {
    host.innerHTML = `<div style="padding:20px; color:var(--ink-soft); font-family:var(--font-mono); font-size:12px;">Solve some questions and tag them with patterns to see your memory decay here.</div>`;
    return;
  }
  
  // Take top 4 most decayed items
  const displayItems = decayItems.slice(0, 4);

  host.innerHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:16px;">` + displayItems.map(item => {
    const isCritical = item.retention < 40;
    const isWarning = item.retention >= 40 && item.retention < 70;
    const color = isCritical ? 'var(--hard)' : (isWarning ? 'var(--gold)' : 'var(--easy)');
    
    return `<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:16px; position:relative; overflow:hidden;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div style="font-family:var(--font-display); font-size:15px; font-weight:700; color:var(--ink);">${esc(item.name)}</div>
        <div style="font-family:var(--font-mono); font-size:20px; font-weight:800; color:${color};">${item.retention}%</div>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="font-size:12px; color:var(--ink-soft);"><span style="color:var(--ink);">${item.stat.solves}</span> solves</div>
        <div style="font-size:12px; color:var(--ink-soft);">Last: ${item.daysSince < 1 ? 'Today' : Math.floor(item.daysSince) + 'd ago'}</div>
      </div>
      
      <!-- Decay Bar -->
      <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden; margin-bottom:16px;">
        <div style="width:${item.retention}%; height:100%; background:${color}; border-radius:3px; transition:width 1s ease-out;"></div>
      </div>
      
      ${isCritical ? `<div style="font-family:var(--font-mono); font-size:10px; color:var(--hard); background:rgba(239,68,68,0.1); padding:6px; border-radius:6px; text-align:center; border:1px solid rgba(239,68,68,0.2);">CRITICAL DECAY: REVISE NOW</div>` : 
        (isWarning ? `<div style="font-family:var(--font-mono); font-size:10px; color:var(--gold); background:rgba(245,158,11,0.1); padding:6px; border-radius:6px; text-align:center; border:1px solid rgba(245,158,11,0.2);">RISK OF FORGETTING</div>` : 
        `<div style="font-family:var(--font-mono); font-size:10px; color:var(--easy); background:rgba(16,185,129,0.1); padding:6px; border-radius:6px; text-align:center; border:1px solid rgba(16,185,129,0.2);">MEMORY STRONG</div>`)}
    </div>`;
  }).join('') + `</div>`;
}
