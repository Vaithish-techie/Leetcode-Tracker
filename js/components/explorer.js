// Explorer Component
window.renderExplorer = function() {
  const root = document.getElementById('explorerContent');
  if (!state.company){
    root.innerHTML = `<div class="panel"><div class="empty-state"><div class="big">No company selected yet</div>Search above to load its question set.</div></div>`;
    return;
  }
  const entries = DATA.companies[state.company];
  if (!entries){ root.innerHTML = `<div class="panel">No data for that company.</div>`; return; }

  const diffCount = {E:0,M:0,H:0};
  const topicCount = {};
  entries.forEach(([pid,freq,rec])=>{
    const p = DATA.problems[pid];
    diffCount[p[1]] = (diffCount[p[1]]||0)+1;
    p[2].forEach(ti => topicCount[ti] = (topicCount[ti]||0)+1);
  });
  const solvedCount = entries.filter(([pid])=> (progress[pid]||{}).status==='solved').length;

  root.innerHTML = `
    <div class="panel">
      <div class="panel-title">${esc(state.company)} <span class="badge-num">${entries.length} questions</span></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-num">${entries.length}</div><div class="stat-label">Total Qs</div></div>
        <div class="stat-card"><div class="stat-num easy">${diffCount.E||0}</div><div class="stat-label">Easy</div></div>
        <div class="stat-card"><div class="stat-num medium">${diffCount.M||0}</div><div class="stat-label">Medium</div></div>
        <div class="stat-card"><div class="stat-num hard">${diffCount.H||0}</div><div class="stat-label">Hard</div></div>
        <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${solvedCount}</div><div class="stat-label">Marked Solved</div></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-title">📋 Question list</div>
      <div class="filters" id="filterHost"></div>
      <div style="overflow-x:auto;"><table id="probTable"></table></div>
    </div>
  `;
  renderFilters(document.getElementById('filterHost'), entries);
  renderTable(document.getElementById('probTable'), entries);
};

function renderFilters(host, entries) {
  const topicSet = new Set();
  entries.forEach(([pid])=> DATA.problems[pid][2].forEach(ti=>topicSet.add(ti)));
  const topics = [...topicSet].map(ti=>DATA.topics[ti]).sort();

  host.innerHTML = `
    <input type="text" id="fSearch" placeholder="Search title…" value="${esc(state.filters.search)}">
    <select id="fDiff"><option value="all">All difficulties</option><option value="E">Easy</option><option value="M">Medium</option><option value="H">Hard</option></select>
    <select id="fTopic"><option value="all">All topics</option>${topics.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select>
    <select id="fStatus"><option value="all">Any status</option><option value="solved">Solved</option><option value="attempted">Attempted</option><option value="none">Not started</option></select>
    <span class="filter-count" id="fCount"></span>
  `;
  ['fSearch','fDiff','fTopic','fStatus'].forEach(id=>{
    document.getElementById(id).addEventListener('input', ()=>{
      state.filters.search = document.getElementById('fSearch').value;
      state.filters.difficulty = document.getElementById('fDiff').value;
      state.filters.topic = document.getElementById('fTopic').value;
      state.filters.status = document.getElementById('fStatus').value;
      renderTable(document.getElementById('probTable'), DATA.companies[state.company]);
    });
  });
}

function renderTable(host, entries, opts) {
  opts = opts || {};
  let rows = entries.filter(([pid,freq,rec])=>{
    const p = DATA.problems[pid];
    const f = state.filters;
    if (f.difficulty!=='all' && p[1]!==f.difficulty) return false;
    if (f.topic!=='all' && !topicNames(p[2]).includes(f.topic)) return false;
    if (f.search && !p[0].toLowerCase().includes(f.search.toLowerCase())) return false;
    const st = (progress[pid]||{}).status || 'none';
    if (f.status!=='all' && st!==f.status) return false;
    return true;
  });
  
  if(document.getElementById('fCount')) document.getElementById('fCount').textContent = `${rows.length} / ${entries.length} shown`;

  rows = rows.sort((a,b)=>{
    const va=a[1], vb=b[1];
    if (va<vb) return -1*state.sortDir; if (va>vb) return 1*state.sortDir; return 0;
  });

  host.innerHTML = `
    <thead><tr>
      <th data-k="title">Problem</th>
      <th data-k="diff">Difficulty</th>
      <th>Topics</th>
      <th data-k="freq">Frequency</th>
      <th>Status</th>
      <th>Note</th>
    </tr></thead>
    <tbody>
      ${rows.map(([pid,freq,rec])=> rowHtml(pid,freq,rec)).join('')}
    </tbody>
  `;
  wireRowControls(host);
}

function rowHtml(pid, freq, rec){
  const p = DATA.problems[pid];
  const [title, diff, topicIdxs, slug] = p;
  const prog = progress[pid] || {};
  const status = prog.status || 'none';
  const hasNote = !!(prog.note || prog.tag);
  return `<tr data-pid="${pid}">
    <td class="prob-title"><a href="https://leetcode.com/problems/${esc(slug)}/" target="_blank">${esc(title)}</a></td>
    <td><span class="diff-tag diff-${diff}">${diffLabel(diff)}</span></td>
    <td>${topicIdxs.slice(0,2).map(ti=>`<span class="topic-pill">${esc(DATA.topics[ti])}</span>`).join('')}</td>
    <td>${freq}%</td>
    <td>
      <select class="status-select st-${status==='none'?'none':status}" data-pid="${pid}">
        <option value="none" ${status==='none'?'selected':''}>Not started</option>
        <option value="attempted" ${status==='attempted'?'selected':''}>Attempted</option>
        <option value="solved" ${status==='solved'?'selected':''}>Solved</option>
      </select>
    </td>
    <td><button class="note-btn ${hasNote?'has-note':''}" data-pid="${pid}">${hasNote? '✎ note':'+ note'}</button></td>
  </tr>`;
}

function wireRowControls(host){
  host.querySelectorAll('.status-select').forEach(sel=>{
    sel.addEventListener('change', async (e)=>{
      const pid = sel.dataset.pid;
      progress[pid] = progress[pid] || {};
      const prevStatus = progress[pid].status;
      progress[pid].status = sel.value;
      if (sel.value==='solved' && prevStatus!=='solved'){
        progress[pid].solvedAt = Date.now();
        fireConfetti();
        showToast('Nice — marked solved. Keep the streak going 🔥');
      }
      sel.className = 'status-select st-' + (sel.value==='none'?'none':sel.value);
      await storeSet('pd_progress_v1', progress);
      if(window.renderMotivStrip) window.renderMotivStrip();
    });
  });
  host.querySelectorAll('.note-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> openNoteModal(btn.dataset.pid));
  });
}

// Autocomplete init
setTimeout(async ()=>{
  await window.dataReady;
  const input = document.getElementById('companySearch');
  const list = document.getElementById('acList');
  const companies = Object.keys(DATA.companies).sort();
  function render(q){
    const ql = q.trim().toLowerCase();
    let items = ql ? companies.filter(c => c.toLowerCase().includes(ql)).slice(0,40) : companies.slice(0,40);
    list.innerHTML = items.map(c => `<div class="ac-item" data-name="${esc(c)}"><span>${esc(c)}</span><span style="font-size:11px;color:var(--ink-soft);">${DATA.companies[c].length} qs</span></div>`).join('');
    list.classList.add('open');
    list.querySelectorAll('.ac-item').forEach(el=>{
      el.addEventListener('click', ()=>{
        input.value = el.dataset.name; list.classList.remove('open');
        state.company = el.dataset.name;
        window.renderExplorer();
      });
    });
  }
  input.addEventListener('focus', ()=> render(input.value));
  input.addEventListener('input', ()=> render(input.value));
  document.addEventListener('click', (e)=>{ if (!input.contains(e.target) && !list.contains(e.target)) list.classList.remove('open'); });
}, 500);
