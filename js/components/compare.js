// Compare Companies Component
window.renderCompare = function() {
  const root = document.getElementById('compareContent');
  const chips = document.getElementById('compareChips');
  
  if (state.compareList.length===0){
    chips.innerHTML = '';
    root.innerHTML = `<div class="empty-state"><div class="big">Select companies above to compare</div>See exactly where Amazon, Google, and Meta overlap.</div>`;
    return;
  }
  
  chips.innerHTML = state.compareList.map(c=>`<span class="company-chip">${esc(c)} <button onclick="window.removeCompare('${esc(c)}')">&times;</button></span>`).join('');
  
  const map = {};
  state.compareList.forEach(c => {
    (DATA.companies[c]||[]).forEach(([pid,freq])=>{
      map[pid] = map[pid] || { count:0, freqSum:0 };
      map[pid].count++; map[pid].freqSum += freq;
    });
  });
  
  const overlap = Object.entries(map).filter(([,m])=>m.count>1).sort((a,b)=>b[1].count-a[1].count || b[1].freqSum-a[1].freqSum);
  if (!overlap.length){
    root.innerHTML = `<div class="panel">These companies have no common questions in the dataset.</div>`;
    return;
  }
  
  root.innerHTML = `
    <div class="panel" style="margin-bottom:0">
      <div class="panel-title">Intersecting questions</div>
      <div class="panel-sub">Questions asked by at least 2 of the selected companies.</div>
      <div style="overflow-x:auto;">
        <table>
          <thead><tr><th>Problem</th><th>Difficulty</th><th>Appears in</th><th>Cumulative Freq</th><th>Status</th></tr></thead>
          <tbody>
            ${overlap.map(([pid,m])=>{
              const p = DATA.problems[pid];
              const st = (progress[pid]||{}).status || 'none';
              return `<tr data-pid="${pid}">
                <td class="prob-title"><a href="https://leetcode.com/problems/${esc(p[3])}/" target="_blank">${esc(p[0])}</a></td>
                <td><span class="diff-tag diff-${p[1]}">${diffLabel(p[1])}</span></td>
                <td style="font-family:var(--font-mono); font-size:12px;">${m.count} / ${state.compareList.length}</td>
                <td style="font-family:var(--font-mono); font-size:12px;">${Math.round(m.freqSum)}</td>
                <td>
                  <select class="status-select st-${st==='none'?'none':st}" data-pid="${pid}">
                    <option value="none" ${st==='none'?'selected':''}>Not started</option>
                    <option value="attempted" ${st==='attempted'?'selected':''}>Attempted</option>
                    <option value="solved" ${st==='solved'?'selected':''}>Solved</option>
                  </select>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  wireRowControls(root);
};

window.removeCompare = function(c) {
  state.compareList = state.compareList.filter(x=>x!==c);
  window.renderCompare();
};

setTimeout(async ()=>{
  await window.dataReady;
  const input = document.getElementById('compareSearch');
  const list = document.getElementById('acListCompare');
  const companies = Object.keys(DATA.companies).sort();
  function render(q){
    const ql = q.trim().toLowerCase();
    let items = ql ? companies.filter(c => c.toLowerCase().includes(ql)).slice(0,30) : [];
    list.innerHTML = items.map(c => `<div class="ac-item" data-name="${esc(c)}"><span>${esc(c)}</span></div>`).join('');
    list.classList.add('open');
    list.querySelectorAll('.ac-item').forEach(el=>{
      el.addEventListener('click', ()=>{
        const nm = el.dataset.name;
        if (!state.compareList.includes(nm) && state.compareList.length<4){ state.compareList.push(nm); }
        input.value = ''; list.classList.remove('open');
        window.renderCompare();
      });
    });
  }
  input.addEventListener('focus', ()=> render(input.value));
  input.addEventListener('input', ()=> render(input.value));
  document.addEventListener('click', (e)=>{ if (!input.contains(e.target) && !list.contains(e.target)) list.classList.remove('open'); });
}, 500);
