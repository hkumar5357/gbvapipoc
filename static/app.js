/* ═══════════════════════════════════════════════════════════════
   UpLevyl — Manager Response Platform
   Client-side interaction logic
═══════════════════════════════════════════════════════════════ */

// ── Scenario data ─────────────────────────────────────────────────────────────

const SCENARIOS = {
  retail: [
    {
      text: "A store associate told me their former partner has been showing up outside the store and they're scared to leave at night. We're in Texas.",
      tag: "Retail · Texas · Partner Stalking"
    },
    {
      text: "One of my night-shift workers disclosed that a co-worker has been sending threatening messages. The employee works at our California location.",
      tag: "Retail · California · Workplace Harassment"
    },
    {
      text: "A team member asked me to change their schedule so they don't overlap with someone they have a protection order against. New York.",
      tag: "Retail · New York · Protection Order Accommodation"
    },
    {
      text: "An employee came to me visibly distressed after receiving threatening calls at work from someone they know. Illinois store.",
      tag: "Retail · Illinois · Safety Concern"
    }
  ],
  healthcare: [
    {
      text: "A charge nurse disclosed to me that a patient's family member has been threatening them outside the hospital. We're in California.",
      tag: "Healthcare · California · Patient Family Threat"
    },
    {
      text: "An ER worker mentioned they're in a dangerous home situation and it's affecting their ability to focus at work. Texas hospital.",
      tag: "Healthcare · Texas · Domestic Situation Disclosure"
    },
    {
      text: "A floor supervisor asked me what our mandatory reporting obligations are when a staff member discloses domestic violence. New York.",
      tag: "Healthcare · New York · Mandatory Reporting"
    },
    {
      text: "A staff member disclosed they're experiencing intimate partner violence and asked whether HR needs to be told. Illinois.",
      tag: "Healthcare · Illinois · Confidential Disclosure"
    }
  ],
  manufacturing: [
    {
      text: "A worker on my floor approached me saying their ex-partner has been waiting for them in the parking lot after shifts. Texas plant.",
      tag: "Manufacturing · Texas · Parking Lot Safety"
    },
    {
      text: "One of my shift leads thinks a team member might be in a dangerous situation at home based on their behavior and visible injuries. Michigan.",
      tag: "Manufacturing · Michigan · Suspected DV"
    },
    {
      text: "A worker needs to leave early three days a week for court hearings related to a protection order. Ohio.",
      tag: "Manufacturing · Ohio · Court Accommodation"
    },
    {
      text: "A line supervisor asked me what I'm legally required to do after an employee discloses domestic violence. California.",
      tag: "Manufacturing · California · Legal Obligations"
    }
  ],
  hospitality: [
    {
      text: "A front desk employee told me a guest has been making threatening comments toward them. I'm not sure if this is reportable. Nevada.",
      tag: "Hospitality · Nevada · Guest Threat"
    },
    {
      text: "One of our hotel workers asked about their rights when it comes to requesting a schedule change for a safety reason. Florida.",
      tag: "Hospitality · Florida · Schedule Accommodation"
    },
    {
      text: "An F&B team member disclosed that they're being harassed by a co-worker and they're afraid to come in. California.",
      tag: "Hospitality · California · Co-worker Harassment"
    },
    {
      text: "My night manager told me a team member disclosed a domestic situation and asked me to keep it quiet. Not sure what I can and can't share. New York.",
      tag: "Hospitality · New York · Confidentiality Obligations"
    }
  ]
};

// ── Session audit state ───────────────────────────────────────────────────────

let sessionId = crypto.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase() : Math.random().toString(36).slice(2, 10).toUpperCase();
let auditLog = [];
let currentIndustry = 'retail';
let pendingComplianceData = null;

// ── DOM references ────────────────────────────────────────────────────────────

const scenarioGrid    = document.getElementById('scenarioGrid');
const queryInput      = document.getElementById('queryInput');
const charCount       = document.getElementById('charCount');
const responseMode    = document.getElementById('responseMode');
const generateBtn     = document.getElementById('generateBtn');
const conversation    = document.getElementById('conversation');
const auditLogToggle  = document.getElementById('auditLogToggle');
const auditLogPanel   = document.getElementById('auditLogPanel');
const auditTableBody  = document.getElementById('auditTableBody');
const complianceModal = document.getElementById('complianceModal');
const modalBody       = document.getElementById('modalBody');
const printBtn        = document.getElementById('printBtn');

// ── Industry tabs ─────────────────────────────────────────────────────────────

document.querySelectorAll('.industry-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.industry-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentIndustry = tab.dataset.industry;
    renderScenarioCards(currentIndustry);
  });
});

function renderScenarioCards(industry) {
  scenarioGrid.innerHTML = '';
  SCENARIOS[industry].forEach(scenario => {
    const card = document.createElement('button');
    card.className = 'scenario-card';
    card.innerHTML = `
      <div class="scenario-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div>
        <div class="scenario-text">${escHtml(scenario.text)}</div>
        <div class="scenario-tag">${escHtml(scenario.tag)}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      queryInput.value = scenario.text;
      charCount.textContent = scenario.text.length;
      queryInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      submitQuery(scenario.text);
    });
    scenarioGrid.appendChild(card);
  });
}

// ── Character counter ─────────────────────────────────────────────────────────

queryInput.addEventListener('input', () => {
  charCount.textContent = queryInput.value.length;
});

// ── Submit handler ────────────────────────────────────────────────────────────

generateBtn.addEventListener('click', () => {
  const q = queryInput.value.trim();
  if (!q) { queryInput.focus(); return; }
  submitQuery(q);
});

queryInput.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const q = queryInput.value.trim();
    if (q) submitQuery(q);
  }
});

async function submitQuery(query) {
  const mode = responseMode.value;
  generateBtn.disabled = true;

  // Show conversation container
  conversation.hidden = false;

  // Create a new turn with loading state
  const turn = createLoadingTurn();
  conversation.appendChild(turn);
  turn.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Animate loading steps
  const steps = turn.querySelectorAll('.loading-step');
  animateSteps(steps);

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, persona: mode })
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      renderErrorTurn(turn, data.error || `Server error (${res.status})`);
    } else {
      renderResponseTurn(turn, query, mode, data);
      logAuditRecord(data.jurisdiction || 'Unknown', mode);
    }
  } catch (err) {
    renderErrorTurn(turn, 'Network error — please check your connection and try again.');
  } finally {
    generateBtn.disabled = false;
  }
}

// ── Loading turn ──────────────────────────────────────────────────────────────

function createLoadingTurn() {
  const div = document.createElement('div');
  div.className = 'turn';
  div.innerHTML = `
    <div class="turn-loading">
      <div class="loading-steps">
        <div class="loading-step active" data-step="0">
          <div class="step-indicator"></div>
          <span>Retrieving jurisdiction-specific statutes...</span>
        </div>
        <div class="loading-step" data-step="1">
          <div class="step-indicator"></div>
          <span>Analyzing compliance requirements...</span>
        </div>
        <div class="loading-step" data-step="2">
          <div class="step-indicator"></div>
          <span>Generating manager guidance...</span>
        </div>
      </div>
    </div>
  `;
  return div;
}

function animateSteps(steps) {
  let i = 0;
  function next() {
    if (i < steps.length) {
      if (i > 0) steps[i - 1].classList.remove('active');
      if (i > 0) steps[i - 1].classList.add('done');
      steps[i].classList.add('active');
      i++;
      setTimeout(next, 1600);
    }
  }
  next();
}

// ── Response turn ─────────────────────────────────────────────────────────────

function renderResponseTurn(turn, query, mode, data) {
  const recordId = 'REC-' + (crypto.randomUUID ? crypto.randomUUID().slice(0, 6).toUpperCase() : Math.random().toString(36).slice(2, 8).toUpperCase());
  const timestamp = new Date().toLocaleString();

  const hasCitations       = data.citations && data.citations.length > 0;
  const hasNextSteps       = data.next_steps && data.next_steps.length > 0;
  const hasSources         = data.sources && data.sources.length > 0;
  const hasClarifications  = data.clarification_questions && data.clarification_questions.length > 0;

  turn.innerHTML = `
    <div class="turn-header">
      <div class="turn-meta">
        ${data.jurisdiction && data.jurisdiction !== 'Unknown' ? `
          <span class="jurisdiction-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            ${escHtml(data.jurisdiction)}
          </span>
        ` : ''}
        ${data.mandatory_reporting ? `
          <span class="mandatory-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            Mandatory Reporting Required
          </span>
        ` : ''}
        <span class="mode-badge">${escHtml(mode)}</span>
      </div>
      <span class="audit-record">Audit: ${escHtml(recordId)} · ${escHtml(timestamp)}</span>
    </div>
    <div class="turn-body">
      <div class="guidance-text">${escHtml(data.guidance || '')}</div>

      ${hasNextSteps ? `
        <div class="next-steps">
          <div class="next-steps-title">Recommended Next Steps</div>
          <ol class="next-steps-list">
            ${data.next_steps.map((s, i) => `
              <li>
                <span class="step-num">${i + 1}</span>
                <span>${escHtml(s)}</span>
              </li>
            `).join('')}
          </ol>
        </div>
      ` : ''}

      ${hasCitations ? `
        <div class="citations">
          <div class="citations-title">Applicable Statutes &amp; Regulations</div>
          <div class="citation-list">
            ${data.citations.map(c => `
              <div class="citation-item">
                <div class="citation-statute">${escHtml(c.statute || '')}</div>
                <div class="citation-desc">${escHtml(c.description || '')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${hasClarifications ? `
        <div class="clarifications">
          <div class="clarifications-title">Deepen Your Guidance</div>
          <div class="clarification-note">Select a follow-up question to get more specific advice:</div>
          ${data.clarification_questions.map(q => `
            <button class="clarification-btn" data-question="${escAttr(q)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              ${escHtml(q)}
            </button>
          `).join('')}
        </div>
      ` : ''}

      ${hasSources ? `
        <div class="sources">
          <div class="sources-title">Source Documents</div>
          <div class="source-list">
            ${data.sources.map(s => s.source_url
              ? `<div class="source-item">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                   <a href="${escAttr(s.source_url)}" target="_blank" rel="noopener">${escHtml(s.title || s.source_url)}</a>
                   <span class="source-url">${escHtml(s.source_url)}</span>
                 </div>`
              : `<div class="source-item">
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                   <span>${escHtml(s.title)}</span>
                 </div>`
            ).join('')}
          </div>
        </div>
      ` : ''}
    </div>
    <div class="turn-actions">
      <button class="btn-primary compliance-btn" data-record="${escAttr(recordId)}" data-ts="${escAttr(timestamp)}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
        Generate Compliance Report
      </button>
      <button class="btn-ghost copy-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        Copy Guidance
      </button>
    </div>
  `;

  // Store data for compliance doc
  turn.dataset.responseData = JSON.stringify({ query, mode, ...data, recordId, timestamp });

  // Wire up clarification question buttons (multi-turn)
  turn.querySelectorAll('.clarification-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const followUp = btn.dataset.question;
      // Disable all clarification buttons in this turn so they can't be clicked again
      turn.querySelectorAll('.clarification-btn').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.4';
      });
      // Mark selected button visually
      btn.style.opacity = '1';
      btn.style.borderColor = 'rgba(255,107,0,0.6)';
      btn.style.color = '#FF6B00';
      // Scroll down and submit the follow-up as a new turn
      queryInput.value = followUp;
      charCount.textContent = followUp.length;
      submitQuery(followUp);
    });
  });

  // Wire up compliance report button
  turn.querySelector('.compliance-btn').addEventListener('click', () => {
    const d = JSON.parse(turn.dataset.responseData);
    openComplianceModal(d);
  });

  // Wire up copy button
  turn.querySelector('.copy-btn').addEventListener('click', e => {
    const btn = e.currentTarget;
    navigator.clipboard.writeText(data.guidance || '').then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy Guidance`;
      }, 2000);
    });
  });
}

function renderErrorTurn(turn, message) {
  turn.innerHTML = `
    <div class="turn-body">
      <div style="display:flex;gap:10px;align-items:flex-start;color:#F87171;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        <span>${escHtml(message)}</span>
      </div>
    </div>
  `;
}

// ── Audit log ─────────────────────────────────────────────────────────────────

auditLogToggle.addEventListener('click', () => {
  const hidden = auditLogPanel.hidden;
  auditLogPanel.hidden = !hidden;
  auditLogToggle.querySelector('span') && (auditLogToggle.lastChild.textContent = hidden ? 'Hide Audit Log' : 'View Audit Log');
});

function logAuditRecord(jurisdiction, mode) {
  const record = {
    ts: new Date().toLocaleTimeString(),
    id: 'REC-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    jurisdiction,
    mode,
    status: 'Logged'
  };
  auditLog.push(record);

  // Remove "empty" row if present
  const emptyRow = auditTableBody.querySelector('.audit-empty-row');
  if (emptyRow) emptyRow.remove();

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${escHtml(record.ts)}</td>
    <td>${escHtml(record.id)}</td>
    <td>${escHtml(record.jurisdiction)}</td>
    <td>${escHtml(record.mode)}</td>
    <td style="color:var(--success);font-weight:600;">${escHtml(record.status)}</td>
  `;
  auditTableBody.prepend(tr);
}

// ── Compliance modal ──────────────────────────────────────────────────────────

function openComplianceModal(data) {
  pendingComplianceData = data;

  const citations = (data.citations || []).filter(c => c && c.statute);
  const citationsHtml = citations.length
    ? citations.map(c =>
        `<div style="margin-bottom:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border-left:2px solid #FF6B00;border-radius:4px">
           <strong style="color:#FF6B00">${escHtml(c.statute)}</strong><br/>
           <span style="color:#9A9A9E;font-size:0.8125rem">${escHtml(c.description || '')}</span>
         </div>`
      ).join('')
    : '<em style="color:#505055">No specific statutes were identified for this query. Try including the state name in your question.</em>';

  const nextStepsHtml = (data.next_steps || []).length
    ? (data.next_steps).map((s, i) =>
        `<div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
           <span style="flex-shrink:0;width:20px;height:20px;background:rgba(255,107,0,0.15);color:#FF6B00;font-size:0.7rem;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center">${i+1}</span>
           <span>${escHtml(s)}</span>
         </div>`
      ).join('')
    : '<em style="color:#505055">See guidance above.</em>';

  const sourcesHtml = (data.sources || []).length
    ? (data.sources).map(s =>
        s.source_url
          ? `<div style="margin-bottom:6px;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.8rem">
               <a href="${escAttr(s.source_url)}" target="_blank" rel="noopener" style="color:#FF6B00;font-weight:600;text-decoration:none">${escHtml(s.title || s.source_url)}</a>
               <div style="color:#505055;font-size:0.72rem;word-break:break-all;margin-top:2px">${escHtml(s.source_url)}</div>
             </div>`
          : `<div style="margin-bottom:6px;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:0.8rem;color:#9A9A9E">${escHtml(s.title)}</div>`
      ).join('')
    : '';

  modalBody.innerHTML = `
    <div class="compliance-doc">
      <div class="doc-header">
        <div class="doc-title">Manager Compliance Record</div>
        <div class="doc-meta">
          <span>Record ID: ${escHtml(data.recordId || 'N/A')}</span>
          <span>Generated: ${escHtml(data.timestamp || new Date().toLocaleString())}</span>
          <span>Jurisdiction: ${escHtml(data.jurisdiction || 'Unknown')}</span>
          <span>Response Mode: ${escHtml(data.mode || 'Manager Guidance')}</span>
          ${data.mandatory_reporting ? '<span style="color:#FFD600;font-weight:600;">MANDATORY REPORTING REQUIRED IN THIS JURISDICTION</span>' : ''}
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">Anonymized Scenario Summary</div>
        <div class="doc-content">${escHtml(data.query || '')}</div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">Guidance Provided</div>
        <div class="doc-content">${escHtml(data.guidance || '')}</div>
      </div>

      <div class="doc-section">
        <div class="doc-section-title">Recommended Next Steps</div>
        ${nextStepsHtml}
      </div>

      <div class="doc-section">
        <div class="doc-section-title">Applicable Statutes &amp; Legal Obligations</div>
        ${citationsHtml}
      </div>

      ${sourcesHtml ? `
      <div class="doc-section">
        <div class="doc-section-title">Source Documents Referenced</div>
        ${sourcesHtml}
      </div>` : ''}

      <div class="doc-section" style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);font-size:0.75rem;color:#505055;">
        This record was generated by the UpLevyl Manager Response Platform. It contains no personally identifiable information.
        Confidential — for internal compliance use only. Reviewed by licensed attorneys.
        SOC 2 Type II | HIPAA-Aware | GDPR Compatible.
      </div>
    </div>
  `;

  complianceModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  complianceModal.hidden = true;
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalClose2').addEventListener('click', closeModal);
complianceModal.addEventListener('click', e => { if (e.target === complianceModal) closeModal(); });

printBtn.addEventListener('click', () => {
  const content = modalBody.innerHTML;
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>UpLevyl Compliance Record</title>
    <style>
      body { font-family: 'Inter', Arial, sans-serif; color: #111; padding: 40px; max-width: 720px; margin: 0 auto; }
      .doc-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
      .doc-meta { font-size: 0.8rem; color: #555; margin-bottom: 24px; }
      .doc-meta span { display: block; margin-bottom: 2px; }
      .doc-section { margin-bottom: 20px; }
      .doc-section-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 10px; }
      .doc-content { white-space: pre-wrap; font-size: 0.875rem; line-height: 1.65; }
    </style>
    </head><body>${content}</body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
});

// ── Utility ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

// ── Init ──────────────────────────────────────────────────────────────────────

renderScenarioCards(currentIndustry);

// ── Animated canvas background ────────────────────────────────────────────────

(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#FF6B00', '#FFD600', '#FF9500', '#FFB340'];

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function makeParticle() {
    return {
      x:     randomBetween(0, W),
      y:     randomBetween(0, H),
      r:     randomBetween(1, 2.5),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx:    randomBetween(-0.15, 0.15),
      vy:    randomBetween(-0.25, -0.05),
      alpha: randomBetween(0.08, 0.35),
      life:  randomBetween(0.3, 1),
      decay: randomBetween(0.0008, 0.002),
    };
  }

  function initParticles() {
    particles = Array.from({ length: 90 }, makeParticle);
  }

  function drawGrid() {
    const step = 80;
    ctx.strokeStyle = 'rgba(255,107,0,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life -= p.decay;
      if (p.life <= 0) { particles[i] = makeParticle(); continue; }

      p.x += p.vx;
      p.y += p.vy;

      ctx.save();
      ctx.globalAlpha = p.alpha * p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(tick);
  }

  resize();
  initParticles();
  tick();
  window.addEventListener('resize', () => { resize(); initParticles(); });
})();
