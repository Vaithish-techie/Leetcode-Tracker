// Mistakes Log Component — always fetches fresh from server

window.renderMistakes = async function() {
  const summary = document.getElementById('mistakeSummary');
  const table   = document.getElementById('mistakeTable');
  const oldTabs = document.getElementById('mistakeCategoryTabs');
  if (oldTabs) oldTabs.style.display = 'none';

  // Show loading state
  table.innerHTML = `<div style="padding:40px; text-align:center; color:var(--ink-soft); font-family:var(--font-mono); font-size:13px;">
    <div style="margin-bottom:8px; opacity:0.5;">⟳</div>Loading your mistake log...
  </div>`;

  // Always fetch fresh from server — this picks up extension-logged problems immediately
  try {
    const freshRes = await fetch('/api/get-data?key=pd_progress_v1');
    if (freshRes.ok) {
      const freshProg = await freshRes.json();
      if (freshProg) progress = freshProg; // update global
    }
  } catch(e) { /* server offline — fall back to in-memory */ }

  // Filter: struggled OR has a tag
  const flagged = Object.entries(progress).filter(([pid, pr]) =>
    pr.status === 'struggled' || pr.tag
  );

  if (!flagged.length) {
    summary.innerHTML = '';
    table.innerHTML = `
      <div style="text-align:center; padding:60px 20px;">
        <div style="font-size:40px; margin-bottom:16px; opacity:0.3;">🩹</div>
        <div style="font-family:var(--font-display); font-size:18px; font-weight:700; color:var(--ink); margin-bottom:8px;">No mistakes logged yet</div>
        <div style="color:var(--ink-soft); font-size:14px; max-width:360px; margin:0 auto; line-height:1.6;">
          Mark a question "Struggled" in the Explorer, or use the Chrome Extension to log problems you're working on.
        </div>
      </div>`;
    return;
  }

  // Sort: most recently logged first
  flagged.sort((a, b) => (b[1].loggedAt || b[1].timestamp || 0) - (a[1].loggedAt || a[1].timestamp || 0));

  // --- Filter UI ---
  const allTags = [...new Set(flagged.map(([,pr]) => pr.tag).filter(Boolean))];
  const allPatterns = [...new Set(flagged.map(([,pr]) => pr.associatedPattern).filter(Boolean))];

  summary.innerHTML = `
    <div style="display:flex; gap:10px; margin-bottom:24px; align-items:center; flex-wrap:wrap;">
      <div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-soft); padding:6px 12px; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid var(--border);">
        ${flagged.length} logged
      </div>
      <select id="mlogFilter" style="background:var(--bg-input); border:1px solid var(--border-strong); color:var(--ink); padding:7px 32px 7px 12px; border-radius:8px; font-family:var(--font-mono); font-size:12px; outline:none; appearance:none; cursor:pointer;">
        <option value="all">All Tags</option>
        ${allTags.map(t => `<option value="${esc(t)}" ${state.mistakeFilter === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
      </select>
      ${allPatterns.length ? `
      <select id="mlogPatternFilter" style="background:var(--bg-input); border:1px solid var(--border-strong); color:var(--ink); padding:7px 32px 7px 12px; border-radius:8px; font-family:var(--font-mono); font-size:12px; outline:none; appearance:none; cursor:pointer;">
        <option value="all">All Patterns</option>
        ${allPatterns.map(p => `<option value="${esc(p)}" ${state.mistakePatternFilter === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}
      </select>` : ''}
      <button onclick="window.renderMistakes()" style="background:transparent; border:1px solid var(--border); color:var(--ink-soft); padding:7px 14px; border-radius:8px; cursor:pointer; font-family:var(--font-mono); font-size:12px; transition:all 0.2s;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--ink-soft)'">↻ Refresh</button>
    </div>`;

  // Apply filters
  const curTag  = state.mistakeFilter || 'all';
  const curPat  = state.mistakePatternFilter || 'all';
  const filtered = flagged.filter(([, pr]) => {
    const matchTag = curTag  === 'all' || pr.tag === curTag;
    const matchPat = curPat  === 'all' || pr.associatedPattern === curPat;
    return matchTag && matchPat;
  });

  if (!filtered.length) {
    table.innerHTML = `<div style="padding:40px; text-align:center; color:var(--ink-soft); font-size:14px;">No entries match this filter.</div>`;
  } else {
    table.innerHTML = `<div style="display:flex; flex-direction:column; gap:16px;">
      ${filtered.map(([pid, pr]) => renderMistakeCard(pid, pr)).join('')}
    </div>`;
  }

  // Attach filter listeners
  const filterSel = document.getElementById('mlogFilter');
  if (filterSel) filterSel.addEventListener('change', e => { state.mistakeFilter = e.target.value; window.renderMistakes(); });
  const patSel = document.getElementById('mlogPatternFilter');
  if (patSel) patSel.addEventListener('change', e => { state.mistakePatternFilter = e.target.value; window.renderMistakes(); });

  // Wire analyze buttons
  document.querySelectorAll('.analyze-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.pid;
      const pr  = progress[pid];
      if (!pr) return;
      const p     = DATA.problems[pid];
      const title = p ? p[0] : (pr.customTitle || 'Unknown Problem');
      window.analyzeMistakeCode(pid, title, pr.code || '');
    });
  });

  // Syntax highlight
  if (window.hljs) setTimeout(() => hljs.highlightAll(), 80);
  
  // Wire delete buttons
  document.querySelectorAll('.mistake-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => window.deleteMistake(btn.dataset.pid));
  });
};

// Delete a mistake entry
window.deleteMistake = async function(pid) {
  if (!confirm('Remove this entry from your Mistake Log?')) return;
  delete progress[pid];
  await storeSet('pd_progress_v1', progress);
  window.renderMistakes();
};

// --- Render a single mistake card ---
function renderMistakeCard(pid, pr) {
  const p     = DATA.problems[pid];
  const title = p ? p[0] : (pr.customTitle || pid);
  const diff  = p ? p[1] : (pr.difficulty || 'M');
  const url   = p ? `https://leetcode.com/problems/${esc(p[3])}/` : externalUrl(pr.customUrl || '#');

  const diffColor = diff === 'E' ? 'var(--easy)' : diff === 'H' ? 'var(--hard)' : 'var(--medium)';
  const diffLabel = diff === 'E' ? 'Easy' : diff === 'H' ? 'Hard' : 'Medium';

  const tagColors = {
    'Aha Moment!': 'var(--gold)',
    'Edge case missed': '#a78bfa',
    'Wrong approach initially': 'var(--accent)',
    'Forgot pattern': '#f472b6',
    'Logic error': 'var(--hard)',
    'Time limit exceeded': '#fb923c',
  };
  const tagColor = tagColors[pr.tag] || 'var(--ink-soft)';

  const stars     = pr.confidence ? '★'.repeat(pr.confidence) + '☆'.repeat(5 - pr.confidence) : '';
  const solveMins = pr.solveTime  ? `${Math.floor(pr.solveTime/60)}:${String(pr.solveTime%60).padStart(2,'0')}` : '';

  // Clean code for display
  const cleanedCode = (pr.code || '').replace(/\u00a0/g, ' ').replace(/\u2003/g, ' ');

  const codeBlock = cleanedCode ? `
    <details class="code-collapse" style="margin-top:14px;">
      <summary style="cursor:pointer; font-family:var(--font-mono); font-size:12px; color:var(--accent); font-weight:600; list-style:none; display:flex; align-items:center; gap:6px; user-select:none; width:fit-content;">
        <span class="code-toggle-icon" style="transition:transform 0.2s;">▶</span> View Code
      </summary>
      <div style="margin-top:10px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
        <pre style="margin:0; padding:16px; background:#0d0d0d; overflow-x:auto;"><code class="language-cpp" style="font-family:var(--font-mono); font-size:12.5px; line-height:1.6;">${esc(cleanedCode)}</code></pre>
      </div>
    </details>` : '';

  // patterns can be string or array (multi-tag from extension)
  const patterns = Array.isArray(pr.associatedPattern)
    ? pr.associatedPattern.filter(Boolean)
    : pr.associatedPattern ? [pr.associatedPattern] : [];

  return `
    <div style="background:var(--bg-panel); border:1px solid var(--border); border-left:3px solid ${diffColor}; border-radius:16px; padding:22px 24px; position:relative; transition:border-color 0.2s, box-shadow 0.2s;"
         onmouseover="this.style.borderColor='var(--border-strong)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.3)'"
         onmouseout="this.style.borderColor='var(--border)'; this.style.borderLeftColor='${diffColor}'; this.style.boxShadow='none'">

      <!-- Header row -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; margin-bottom:12px;">
        <div style="flex:1; min-width:0;">
          <a href="${url}" target="_blank" style="font-family:var(--font-display); font-size:17px; font-weight:800; color:var(--ink); text-decoration:none; letter-spacing:-0.3px; display:block; margin-bottom:8px; transition:color 0.2s;"
             onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--ink)'">${esc(title)}</a>
          <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px;">
            <span style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:${diffColor}; background:${diffColor}18; padding:2px 8px; border-radius:5px;">${diffLabel}</span>
            ${pr.tag ? `<span style="font-family:var(--font-mono); font-size:11px; font-weight:600; color:${tagColor}; background:${tagColor}18; padding:2px 8px; border-radius:5px; border:1px solid ${tagColor}30;">${esc(pr.tag)}</span>` : ''}
            ${patterns.map(pat => `<span style="font-family:var(--font-mono); font-size:11px; color:#818cf8; background:rgba(129,140,248,0.1); padding:2px 8px; border-radius:5px;">⬡ ${esc(pat)}</span>`).join('')}
            ${stars ? `<span style="font-family:var(--font-mono); font-size:11px; color:var(--gold); letter-spacing:1px;">${stars}</span>` : ''}
            ${solveMins ? `<span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-faint);">⏱ ${solveMins}</span>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:8px; flex-shrink:0;">
          ${cleanedCode ? `<button class="btn btn-primary btn-sm analyze-btn" data-pid="${pid}" style="font-size:12px; padding:7px 14px;">🧠 Analyse</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="openNoteModal('${pid}')" style="font-size:12px; padding:7px 14px;">✏️ Edit</button>
          <button class="btn btn-ghost btn-sm mistake-delete-btn" data-pid="${pid}" style="font-size:12px; padding:7px 14px; color:var(--hard); border-color:rgba(239,68,68,0.3);" title="Remove from log">🗑</button>
        </div>
      </div>

      <!-- Notes -->
      ${pr.note ? `<div style="font-size:14px; color:var(--ink-soft); line-height:1.75; white-space:pre-wrap; padding:12px 16px; background:rgba(255,255,255,0.02); border-radius:10px; border-left:2px solid var(--border-strong); font-family:var(--font-body);">${esc(pr.note)}</div>` : ''}

      <!-- Code -->
      ${codeBlock}

      <!-- Analysis Result -->
      <div id="analysis-${pid}" style="display:none; margin-top:16px;"></div>
    </div>`;
}

// ---- Code Analysis ----
window.analyzeMistakeCode = async function(pid, title, code) {
  const container = document.getElementById(`analysis-${pid}`);
  if (!container) return;
  container.style.display = 'block';
  container.innerHTML = `
    <div style="padding:20px; border:1px solid rgba(56,189,248,0.2); border-radius:12px; background:rgba(56,189,248,0.03); display:flex; align-items:center; gap:12px;">
      <div style="width:8px; height:8px; border-radius:50%; background:var(--accent); animation:pulse 1s infinite;"></div>
      <span style="font-family:var(--font-mono); font-size:13px; color:var(--accent);">JARVIS is analyzing your code...</span>
    </div>`;

  try {
    const res = await fetch('/api/jarvis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'analyze_code', code, title })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    let jsonStr = data.text.replace(/```json/g,'').replace(/```/g,'').trim();
    const r = JSON.parse(jsonStr);

    // Unique ID for each analysis panel
    const graphId = `complexity-graph-${pid}`;

    function getIdx(tc) {
      const u = (tc || '').replace(/\s/g,'').toUpperCase();
      if (u.includes('NLOG')) return 3;
      if (u.includes('N^2') || u.includes('N*N') || u.includes('N2')) return 4;
      if (u.includes('2^') || u.includes('!')) return 5;
      if (u.includes('LOG')) return 1;
      if (u.includes('N)') || (u.includes('N') && !u.includes('^'))) return 2;
      if (u.includes('1)') || u === 'O(1)') return 0;
      return 2;
    }

    function complexityGraph(label, yourTc, optTc, canvasId) {
      const yi = getIdx(yourTc);
      const oi = getIdx(optTc);
      return `
        <div style="margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-family:var(--font-display); font-size:13px; font-weight:700; color:var(--ink);">${label}</span>
            <div style="display:flex; gap:8px; font-family:var(--font-mono); font-size:11px;">
              <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:20px; height:2px; background:rgba(255,255,255,0.5); border-top: 2px dashed rgba(255,255,255,0.5);"></span> You: ${esc(yourTc)}</span>
              <span style="display:flex; align-items:center; gap:4px;"><span style="display:inline-block; width:20px; height:2px; background:#38bdf8;"></span> Best: ${esc(optTc)}</span>
            </div>
          </div>
          <div style="position:relative;">
            <canvas id="${canvasId}" width="600" height="160" style="width:100%; height:160px; border-radius:8px; background:#0a0a0c; border:1px solid rgba(255,255,255,0.06); display:block; cursor:crosshair;"></canvas>
            <div id="${canvasId}-tooltip" style="display:none; position:absolute; background:rgba(10,10,20,0.95); border:1px solid var(--accent); border-radius:6px; padding:5px 10px; font-family:var(--font-mono); font-size:11px; color:var(--accent); pointer-events:none; white-space:nowrap; z-index:10;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:6px; padding:0 4px;">
            ${['O(1)','O(log N)','O(N)','O(N log N)','O(N²)','O(2ᴺ)'].map((l,i) => `<span style="font-family:var(--font-mono); font-size:9px; color:${i===yi?'rgba(255,255,255,0.9)':(i===oi?'#38bdf8':'var(--ink-faint)')}; font-weight:${i===yi||i===oi?'700':'400'};">${l}</span>`).join('')}
          </div>
        </div>`;
    }

    // Defer canvas drawing until DOM is ready
    function drawComplexityGraph(canvasId, yourIdx, optIdx) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const PAD = { l: 30, r: 10, t: 15, b: 20 };
      const gW = W - PAD.l - PAD.r;
      const gH = H - PAD.t - PAD.b;

      // The 6 complexity curves as functions of x (0..1) → y (0..1, where 1=high ops)
      const N = 50; // sample points
      const curves = [
        { label: 'O(1)',       fn: () => 0.02,                              color: '#10b981' },
        { label: 'O(log N)',   fn: x => Math.log2(x * 50 + 1) / Math.log2(51) * 0.35, color: '#34d399' },
        { label: 'O(N)',       fn: x => x * 0.7,                            color: '#f59e0b' },
        { label: 'O(N log N)', fn: x => x * (Math.log2(x * 50 + 1) / Math.log2(51)) * 1.1, color: '#fb923c' },
        { label: 'O(N²)',      fn: x => x * x * 0.98,                       color: '#f43f5e' },
        { label: 'O(2ᴺ)',      fn: x => Math.min(1, (Math.pow(2, x * 7) - 1) / 127), color: '#dc2626' },
      ];

      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = PAD.t + gH * (i / 4);
        ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(PAD.l + gW, y); ctx.stroke();
      }

      // Axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('ops', 2, PAD.t + 8);
      ctx.fillText('N →', PAD.l + gW - 20, H - 4);

      // Draw all curves
      curves.forEach((c, i) => {
        const isYou = i === yourIdx;
        const isOpt = i === optIdx;
        ctx.beginPath();
        ctx.lineWidth = isYou || isOpt ? 2.5 : 1;
        ctx.strokeStyle = isYou ? 'rgba(255,255,255,0.7)' : (isOpt ? '#38bdf8' : c.color + '30');
        if (isYou) ctx.setLineDash([6, 4]);
        else ctx.setLineDash([]);
        for (let s = 0; s <= N; s++) {
          const x = s / N;
          const yv = c.fn(x);
          const px = PAD.l + x * gW;
          const py = PAD.t + gH - yv * gH;
          s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Hover tooltip
      const tooltip = document.getElementById(canvasId + '-tooltip');
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        const x = Math.max(0, Math.min(1, (mx - PAD.l) / gW));

        // Find closest curve at mouse x
        let best = null, bestDist = Infinity;
        const mouseY = (e.clientY - rect.top) * (H / rect.height);
        curves.forEach((c, i) => {
          const yv = c.fn(x);
          const py = PAD.t + gH - yv * gH;
          const d = Math.abs(mouseY - py);
          if (d < bestDist) { bestDist = d; best = { c, i }; }
        });

        if (best && bestDist < 20) {
          const i = best.i;
          const isYou = i === yourIdx, isOpt = i === optIdx;
          tooltip.style.display = 'block';
          tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
          tooltip.style.top = (e.clientY - rect.top - 24) + 'px';
          tooltip.style.borderColor = best.c.color;
          tooltip.style.color = best.c.color;
          const badge = isYou ? ' ← your code' : (isOpt ? ' ← optimal' : '');
          tooltip.textContent = best.c.label + badge;
        } else {
          tooltip.style.display = 'none';
        }
      });
      canvas.addEventListener('mouseleave', () => { if(tooltip) tooltip.style.display = 'none'; });
    }



    container.innerHTML = `
      <div style="border:1px solid rgba(56,189,248,0.15); border-radius:14px; overflow:hidden; background:rgba(10,10,12,0.9);">

        <!-- Header -->
        <div style="padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:10px; background:rgba(56,189,248,0.04);">
          <span style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:1px;">JARVIS Analysis</span>
        </div>

        <div style="padding:20px; display:flex; flex-direction:column; gap:24px;">

          <!-- Complexity Graphs -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; padding:20px; background:rgba(255,255,255,0.02); border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
            ${complexityGraph('Time Complexity', r.your_tc || 'O(?)', r.optimal_tc || 'O(?)', graphId + '-tc')}
            ${complexityGraph('Space Complexity', r.your_sc || 'O(?)', r.optimal_sc || 'O(?)', graphId + '-sc')}
          </div>

          <!-- Approach breakdown -->
          <div style="padding:18px 20px; background:rgba(255,255,255,0.02); border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-faint); text-transform:uppercase; letter-spacing:1px; margin-bottom:14px;">Approach</div>
            <div style="display:flex; flex-direction:column; gap:10px; font-size:14px;">
              <div style="display:flex; gap:8px;">
                <span style="color:var(--ink-faint); width:90px; flex-shrink:0;">Current</span>
                <span style="color:var(--ink); font-weight:600;">${esc(r.current_approach || '—')}</span>
              </div>
              <div style="display:flex; gap:8px;">
                <span style="color:var(--ink-faint); width:90px; flex-shrink:0;">Suggested</span>
                <span style="color:var(--accent); font-weight:700;">${esc(r.suggested_approach || '—')}</span>
              </div>
              <div style="height:1px; background:rgba(255,255,255,0.05); margin:4px 0;"></div>
              <div>
                <div style="color:var(--ink-faint); font-size:12px; margin-bottom:4px; font-family:var(--font-mono);">KEY IDEA</div>
                <div style="color:var(--ink); line-height:1.6;">${esc(r.key_idea || r.feedback || '—')}</div>
              </div>
              ${(r.consider || r.feedback) ? `
              <div style="padding:12px 14px; background:rgba(16,185,129,0.06); border-radius:8px; border-left:3px solid var(--easy);">
                <div style="color:var(--easy); font-size:11px; font-family:var(--font-mono); font-weight:700; margin-bottom:6px;">THINK ABOUT</div>
                <div style="color:var(--ink-soft); line-height:1.6; font-size:13px;">${esc(r.consider || r.feedback)}</div>
              </div>` : ''}
            </div>
          </div>

          <!-- Optimal Code -->
          ${r.optimal_code ? `
          <div style="max-width: 100%; overflow:hidden;">
            <div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-faint); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">Optimal Solution</div>
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); max-width: 100%;">
              <div style="padding:8px 14px; background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.05); font-family:var(--font-mono); font-size:11px; color:var(--ink-faint);">solution.cpp</div>
              <pre style="margin:0; padding:16px; background:#0a0a0c; overflow-x:auto; white-space:pre-wrap; word-wrap:break-word; max-width: 100%;"><code class="language-cpp" style="font-family:var(--font-mono); font-size:12.5px; line-height:1.65; max-width: 100%; display:block;">${esc(r.optimal_code.replace(/\\n/g, '\n'))}</code></pre>
            </div>
          </div>` : ''}

        </div>
      </div>`;

    if (window.hljs) {
      setTimeout(() => container.querySelectorAll('code').forEach(el => hljs.highlightElement(el)), 50);
    }
    // Draw interactive canvas graphs AFTER HTML is injected
    setTimeout(() => {
      drawComplexityGraph(graphId + '-tc', getIdx(r.your_tc || ''), getIdx(r.optimal_tc || ''));
      drawComplexityGraph(graphId + '-sc', getIdx(r.your_sc || ''), getIdx(r.optimal_sc || ''));
    }, 60);

  } catch (err) {
    container.innerHTML = `
      <div style="padding:16px 20px; border:1px solid rgba(239,68,68,0.2); border-radius:12px; background:rgba(239,68,68,0.04);">
        <span style="font-family:var(--font-mono); font-size:13px; color:var(--hard);">[ERROR] ${esc(err.message)}</span>
        <div style="font-size:12px; color:var(--ink-faint); margin-top:4px;">Is <code>node server.js</code> running? Is <code>GEMINI_API_KEY</code> set in <code>.env</code>?</div>
      </div>`;
  }
};
