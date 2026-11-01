// Job Pipeline Kanban Component
let jobPipeline = [];

window.renderPipelineTab = async function() {
  const container = document.getElementById('tab-pipeline');
  
  try {
    const res = await fetch('/api/get-data?key=pd_jobs_v1');
    if (res.ok) jobPipeline = (await res.json()) || [];
  } catch(e) {}
  
  if (!Array.isArray(jobPipeline)) jobPipeline = [];

  const columns = [
    { id: 'wishlist', title: 'Wishlist / Applied', color: 'var(--ink)' },
    { id: 'oa', title: 'OA Received', color: 'var(--medium)' },
    { id: 'interview', title: 'Interviewing', color: 'var(--accent)' },
    { id: 'offer', title: 'Offer / Accepted', color: 'var(--easy)' },
    { id: 'rejected', title: 'Rejected', color: 'var(--hard)' }
  ];

  let html = `
    <div style="padding: 24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <div>
          <h2 style="font-family:var(--font-display); font-size:24px; font-weight:800; color:var(--ink); margin:0;">Job Pipeline</h2>
          <div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-soft); margin-top:4px;">Drag and drop applications across your interview stages.</div>
        </div>
        <button class="btn btn-primary" onclick="window.addJobApplication()" style="font-size:13px;">+ New Application</button>
      </div>
      
      <div style="display:flex; gap:16px; overflow-x:auto; padding-bottom:20px; align-items:flex-start;">
        ${columns.map(c => `
          <div style="flex: 0 0 280px; background:var(--bg-panel); border:1px solid var(--border); border-radius:12px; display:flex; flex-direction:column; max-height:80vh;"
               ondragover="event.preventDefault(); this.style.borderColor='${c.color}';"
               ondragleave="this.style.borderColor='var(--border)';"
               ondrop="event.preventDefault(); this.style.borderColor='var(--border)'; window.moveJob(event.dataTransfer.getData('jobId'), '${c.id}')">
            
            <div style="padding:16px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:${c.color}; text-transform:uppercase; letter-spacing:0.5px;">${c.title}</span>
              <span style="font-family:var(--font-mono); font-size:11px; background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:10px; color:var(--ink-soft);">${jobPipeline.filter(j=>j.status===c.id).length}</span>
            </div>
            
            <div style="padding:12px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:12px; min-height:100px;">
              ${jobPipeline.filter(j => j.status === c.id).map(j => `
                <div draggable="true" ondragstart="event.dataTransfer.setData('jobId', '${j.id}')"
                     style="background:rgba(255,255,255,0.03); border:1px solid var(--border-strong); border-radius:8px; padding:12px; cursor:grab; transition:all 0.2s;"
                     onmouseover="this.style.borderColor='${c.color}'" onmouseout="this.style.borderColor='var(--border-strong)'">
                  <div style="font-family:var(--font-display); font-size:14px; font-weight:700; color:var(--ink); margin-bottom:4px; display:flex; justify-content:space-between;">
                    ${esc(j.company)}
                    <button style="background:none; border:none; color:var(--hard); cursor:pointer; font-size:12px; opacity:0.5; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.5" onclick="window.deleteJob('${j.id}')">×</button>
                  </div>
                  <div style="font-family:var(--font-body); font-size:12px; color:var(--ink-soft); margin-bottom:8px;">${esc(j.role)}</div>
                  ${j.date ? `<div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-faint);">Applied: ${new Date(j.date).toLocaleDateString()}</div>` : ''}
                  ${c.id === 'oa' || c.id === 'interview' ? `
                    <button class="btn btn-sm" onclick="window.jarvisCompanyPrep('${esc(j.company)}')" style="width:100%; margin-top:10px; font-size:11px; padding:4px; background:var(--accent-bg); color:var(--accent); border:1px solid rgba(56,189,248,0.2);">🧠 Prep Plan</button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Add Job Modal -->
    <div class="modal-bg" id="jobModal">
      <div class="modal">
        <h3>Add Application</h3>
        <label>Company</label>
        <input type="text" id="jobCompany" placeholder="e.g. Google">
        <label>Role</label>
        <input type="text" id="jobRole" placeholder="e.g. SDE Intern">
        <label>Date Applied</label>
        <input type="date" id="jobDate">
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="document.getElementById('jobModal').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.saveNewJob()">Save</button>
        </div>
      </div>
    </div>
    
    <!-- Jarvis Prep Modal -->
    <div class="modal-bg" id="jarvisPrepModal">
      <div class="modal" style="max-width:600px; width:90%;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 id="jarvisPrepTitle" style="margin:0;">Company Prep</h3>
          <button style="background:none; border:none; color:var(--ink-soft); cursor:pointer; font-size:20px;" onclick="document.getElementById('jarvisPrepModal').classList.remove('open')">×</button>
        </div>
        <div id="jarvisPrepContent" style="font-family:var(--font-body); font-size:14px; line-height:1.6; color:var(--ink-soft); max-height:60vh; overflow-y:auto; padding-right:10px;"></div>
      </div>
    </div>
  `;
  container.innerHTML = html;
  container.style.display = 'block';
  document.getElementById('jobDate').value = new Date().toISOString().slice(0,10);
};

window.addJobApplication = function() {
  document.getElementById('jobCompany').value = '';
  document.getElementById('jobRole').value = '';
  document.getElementById('jobModal').classList.add('open');
};

window.saveNewJob = async function() {
  const company = document.getElementById('jobCompany').value.trim();
  const role = document.getElementById('jobRole').value.trim();
  const date = document.getElementById('jobDate').value;
  if (!company) return;
  
  jobPipeline.push({
    id: 'job_' + Date.now(),
    company,
    role,
    date,
    status: 'wishlist'
  });
  
  await storeSet('pd_jobs_v1', jobPipeline);
  document.getElementById('jobModal').classList.remove('open');
  window.renderPipelineTab();
};

window.moveJob = async function(id, newStatus) {
  const job = jobPipeline.find(j => j.id === id);
  if (job) {
    job.status = newStatus;
    await storeSet('pd_jobs_v1', jobPipeline);
    window.renderPipelineTab();
  }
};

window.deleteJob = async function(id) {
  if (!confirm('Delete this application?')) return;
  jobPipeline = jobPipeline.filter(j => j.id !== id);
  await storeSet('pd_jobs_v1', jobPipeline);
  window.renderPipelineTab();
};

window.jarvisCompanyPrep = async function(company) {
  document.getElementById('jarvisPrepTitle').textContent = `JARVIS Prep: ${company}`;
  const content = document.getElementById('jarvisPrepContent');
  content.innerHTML = `<div style="text-align:center; padding:40px;"><div style="width:12px; height:12px; border-radius:50%; background:var(--accent); animation:pulse 1s infinite; margin:0 auto 12px;"></div>Generating 3-day study plan and fetching top questions for ${company}...</div>`;
  document.getElementById('jarvisPrepModal').classList.add('open');
  
  try {
    const res = await fetch('/api/jarvis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'custom',
        prompt: `Generate a quick, bulleted 3-day interview prep plan for ${company} Software Engineering role. Include what DSA topics they focus on (e.g., Graphs, DP, String Manipulation) and 3-4 specific LeetCode problem names they frequently ask.`
      })
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error);
    content.textContent = data.text || '';
    content.style.whiteSpace = 'pre-wrap';
  } catch(e) {
    content.innerHTML = `<span style="color:var(--hard);">Failed to connect to JARVIS: ${e.message}</span>`;
  }
};
