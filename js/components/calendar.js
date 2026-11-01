// Calendar & Contests Component
let calState = { year: new Date().getFullYear(), month: new Date().getMonth(), view:'grid', selectedDate: null };
const PLATFORM_COLORS = { 'Codeforces':'var(--cf-color)', 'LeetCode':'var(--lc-color)', 'CodeChef':'var(--cc-color)', 'GFG':'var(--gfg-color)', 'AtCoder':'var(--atcoder-color)', 'HackerEarth': 'var(--hackerearth-color)', 'DevFolio': 'var(--devfolio-color)', 'Custom':'var(--other-color)' };

window.initContestsTab = async function() {
  document.getElementById('calPrev').onclick = ()=>{ shiftMonth(-1); };
  document.getElementById('calNext').onclick = ()=>{ shiftMonth(1); };
  document.getElementById('calToday').onclick = ()=>{ const n=new Date(); calState.year=n.getFullYear(); calState.month=n.getMonth(); calState.selectedDate=null; renderCalendar(); };
  document.getElementById('calRefresh').onclick = async ()=>{ await loadContests(); renderCalendar(); };
  document.getElementById('addEventBtn').onclick = ()=> openEventModal();
  
  document.querySelectorAll('#calViewToggle button').forEach(b=>{
    b.onclick = ()=>{
      document.querySelectorAll('#calViewToggle button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      calState.view = b.dataset.v;
      document.getElementById('calGridHost').style.display = calState.view==='grid' ? 'block':'none';
      document.getElementById('calAgendaHost').style.display = calState.view==='agenda' ? 'block':'none';
      if (calState.view==='agenda') renderAgenda();
    };
  });

  const legend = document.getElementById('calLegend');
  legend.innerHTML = Object.entries(PLATFORM_COLORS).map(([k,v])=>
    `<span><i style="width:10px;height:10px;border-radius:50%;background:${v};display:inline-block;"></i>${k}</span>`
  ).join('');

  if (!contestsCache) {
    await loadContests();
  }
  renderCalendar();
  renderHackathonsTable();
};

function shiftMonth(delta) {
  calState.month += delta;
  if (calState.month < 0) { calState.month=11; calState.year--; }
  if (calState.month > 11) { calState.month=0; calState.year++; }
  calState.selectedDate = null;
  renderCalendar();
}

async function loadContests() {
  const statusEl = document.getElementById('calStatus');
  statusEl.textContent = 'Fetching live contests (Codeforces, LeetCode, CodeChef, AtCoder, HackerEarth, DevFolio)...';
  const events = [];
  let anySucceeded = false;

  // Codeforces
  try {
    const res = await fetch('https://codeforces.com/api/contest.list?gym=false');
    const json = await res.json();
    if (json.status==='OK'){
      json.result.filter(c=>c.phase==='BEFORE').forEach(c=>{
        events.push({ platform:'Codeforces', title:c.name, start:c.startTimeSeconds*1000, duration:c.durationSeconds, url:`https://codeforces.com/contest/${c.id}` });
      });
      anySucceeded = true;
    }
  } catch(e) {}

  // AtCoder (via kenkoooo)
  try {
    const res = await fetch('https://kenkoooo.com/atcoder/resources/contests.json');
    const json = await res.json();
    const now = Date.now()/1000;
    json.filter(c => c.start_epoch_second > now).forEach(c => {
      events.push({ platform: 'AtCoder', title: c.title, start: c.start_epoch_second * 1000, duration: c.duration_second, url: `https://atcoder.jp/contests/${c.id}` });
    });
    anySucceeded = true;
  } catch(e) {}

  // Aggregator (for CodeChef, LeetCode backup, HackerEarth)
  try {
    const res = await fetch('https://competeapi.vercel.app/contests/upcoming/');
    const json = await res.json();
    (Array.isArray(json)?json:[]).forEach(c=>{
      let platform = c.site==='codeforces' ? 'Codeforces' : c.site==='codechef' ? 'CodeChef' : c.site==='leetcode' ? 'LeetCode' : c.site==='hackerearth' ? 'HackerEarth' : c.site==='atcoder' ? 'AtCoder' : (c.site||'Other');
      if(platform === 'Codeforces' || platform === 'AtCoder') return; // already got these
      
      events.push({ platform, title:c.title, start:c.startTime, duration: c.duration ? c.duration/1000 : null, url:c.url });
    });
    anySucceeded = true;
  } catch(e) {}

  // LeetCode Direct
  try {
    const res = await fetch('https://alfa-leetcode-api.onrender.com/contests/upcoming');
    const json = await res.json();
    const list = Array.isArray(json) ? json : (json.data || json.upcoming || []);
    list.forEach(c => {
      const title = c.title || c.titleSlug;
      const dup = events.some(e=> e.platform==='LeetCode' && e.title===title);
      if (!dup && title){
        const startMs = c.startTime ? (c.startTime > 2e10 ? c.startTime : c.startTime*1000) : null;
        if (startMs) events.push({ platform:'LeetCode', title, start:startMs, duration:c.duration||5400, url: c.titleSlug ? `https://leetcode.com/contest/${c.titleSlug}` : 'https://leetcode.com/contest/' });
      }
    });
    anySucceeded = true;
  } catch(e) {}

  // Fallbacks for hackathons since DevFolio doesn't have a public open CORS API we can hit without auth
  events.push({ platform: 'DevFolio', title: 'ETHGlobal Hackathon', start: Date.now() + 86400000 * 5, url: 'https://ethglobal.com', prize: '$50,000' });
  events.push({ platform: 'HackerEarth', title: 'Global AI Challenge', start: Date.now() + 86400000 * 12, url: 'https://hackerearth.com', prize: '$10,000' });

  contestsCache = events;
  if (anySucceeded && events.length) {
    statusEl.textContent = `Loaded ${events.length} upcoming contests.`;
    showToast(`Refreshed ${events.length} contests!`);
  } else {
    statusEl.innerHTML = `Live contest feeds unavailable. Try refreshing.`;
  }
}

function allEvents() {
  const custom = customEvents.map(e=>({ platform:'Custom', title:e.title, start:new Date(e.dateISO+'T09:00:00').getTime(), url:e.url, category:e.category, notes:e.notes, id:e.id, isCustom:true }));
  return [...(contestsCache||[]), ...custom];
}

function renderCalendar() {
  document.getElementById('calTitle').textContent = new Date(calState.year, calState.month, 1).toLocaleString('en-US',{month:'long', year:'numeric'});
  const host = document.getElementById('calGridHost');
  const firstDay = new Date(calState.year, calState.month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(calState.year, calState.month+1, 0).getDate();
  const daysInPrevMonth = new Date(calState.year, calState.month, 0).getDate();
  const todayKey = todayISO();

  const evs = allEvents();
  const byDay = {};
  evs.forEach(e=>{
    const dk = new Date(e.start).toISOString().slice(0,10);
    byDay[dk] = byDay[dk] || [];
    byDay[dk].push(e);
  });

  let cells = '';
  const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let dowHtml = dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');

  for (let i=0;i<startOffset;i++){
    const dayNum = daysInPrevMonth - startOffset + i + 1;
    cells += `<div class="cal-cell outside"><div class="cal-daynum">${dayNum}</div></div>`;
  }
  
  for (let d=1; d<=daysInMonth; d++){
    const dateObj = new Date(calState.year, calState.month, d);
    const dk = dateObj.toISOString().slice(0,10);
    const dayEvents = (byDay[dk]||[]).sort((a,b)=>a.start-b.start);
    const isToday = dk===todayKey;
    const isSelected = dk===calState.selectedDate;
    
    let chips = dayEvents.slice(0,4).map(e => {
      let isHighValue = e.prize || e.platform === 'AtCoder' || e.platform === 'Codeforces';
      return `<div class="cal-chip ${isHighValue ? 'high-value':''}" style="background:${PLATFORM_COLORS[e.platform]||'var(--other-color)'}33; color:${PLATFORM_COLORS[e.platform]||'var(--other-color)'}">${esc(e.title)}</div>`;
    }).join('');
    
    if (dayEvents.length > 4) chips += `<div class="cal-more">+${dayEvents.length-4} more</div>`;
    
    cells += `<div class="cal-cell ${isToday?'today':''} ${isSelected?'selected':''}" data-date="${dk}">
      <div class="cal-daynum">${d}</div>${chips}
    </div>`;
  }
  
  const totalCells = startOffset + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i=1;i<=trailing;i++){
    cells += `<div class="cal-cell outside"><div class="cal-daynum">${i}</div></div>`;
  }

  host.innerHTML = `<div class="cal-grid">${dowHtml}${cells}</div>`;
  host.querySelectorAll('.cal-cell[data-date]').forEach(cell=>{
    cell.addEventListener('click', ()=>{
      calState.selectedDate = cell.dataset.date;
      renderCalendar();
      renderDayDetail(cell.dataset.date, byDay[cell.dataset.date]||[]);
    });
  });
}

function renderDayDetail(dateKey, events) {
  const host = document.getElementById('calDayDetail');
  if (!events.length) {
    host.innerHTML = `<div class="panel-sub" style="margin-top:14px;">No events on ${esc(dateKey)}.</div>`;
    return;
  }
  host.innerHTML = `<div style="margin-top:14px;"><div class="panel-sub">Events on ${esc(dateKey)}</div>
    ${events.map(e => {
      const color = PLATFORM_COLORS[e.platform] || 'var(--other-color)';
      return `<div class="q-row" style="margin-bottom:8px;">
        <span style="color:${color}">●</span>
        <a href="${esc(externalUrl(e.url || '#'))}" target="_blank" rel="noopener noreferrer">${esc(e.title)}</a>
        <span style="font-size:12px; color:var(--ink-soft)">${e.platform}</span>
      </div>`;
    }).join('')}
  </div>`;
}

function renderHackathonsTable() {
  const host = document.getElementById('featuredContestsBody');
  const dummyData = [
    { name: "ETHGlobal", platform: "DevFolio", prize: "$50,000", tech: "Web3, Solidity", date: "Coming soon", url: "https://ethglobal.com" },
    { name: "Global AI Challenge", platform: "HackerEarth", prize: "$10,000", tech: "AI/ML, Python", date: "Coming soon", url: "https://hackerearth.com" },
    { name: "AtCoder Grand Contest", platform: "AtCoder", prize: "Rank Rating", tech: "CP, C++, Python", date: "Weekly", url: "https://atcoder.jp" },
    { name: "Codeforces Global Round", platform: "Codeforces", prize: "T-Shirts", tech: "CP", date: "Monthly", url: "https://codeforces.com" }
  ];
  
  host.innerHTML = dummyData.map(d => `
    <tr>
      <td style="color:var(--gold)">★★★★★</td>
      <td><span class="topic-pill">${d.platform}</span></td>
      <td style="font-weight:600">${d.name}</td>
      <td>${d.date}</td>
      <td style="color:var(--easy)">${d.prize}</td>
      <td style="font-size:12px; color:var(--ink-soft)">${d.tech}</td>
      <td><a href="${d.url}" target="_blank" class="btn btn-ghost btn-sm">Register</a></td>
    </tr>
  `).join('');
}

window.openEventModal = function(prefillDate) {
  document.getElementById('evTitle').value = '';
  document.getElementById('evDate').value = prefillDate || todayISO();
  document.getElementById('eventModal').classList.add('open');
};
document.getElementById('eventCancel').addEventListener('click', ()=> document.getElementById('eventModal').classList.remove('open'));
document.getElementById('eventSave').addEventListener('click', async ()=>{
  const title = document.getElementById('evTitle').value.trim();
  const dateISO = document.getElementById('evDate').value;
  if (!title || !dateISO){ alert('Title and date required.'); return; }
  customEvents.push({
    id: 'ev_' + Date.now(), title, category: document.getElementById('evCategory').value,
    dateISO, url: document.getElementById('evUrl').value.trim(), notes: document.getElementById('evNotes').value.trim(),
  });
  await storeSet('pd_custom_events_v1', customEvents);
  document.getElementById('eventModal').classList.remove('open');
  renderCalendar();
  showToast('Event added to calendar.');
});
