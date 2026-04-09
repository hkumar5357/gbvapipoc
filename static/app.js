/* ═══════════════════════════════════════════════════════════════
   UpLevyl Enterprise Domain API – Client JS
═══════════════════════════════════════════════════════════════ */

// ── Background particles ──────────────────────────────────────────────────
(function spawnParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;
    const colors = ['#FF6B00', '#FFD600', '#FF8C00', '#FFAA00'];
    for (let i = 0; i < 28; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 120 + 40;
        p.style.cssText = [
            `width:${size}px`,
            `height:${size}px`,
            `left:${Math.random() * 100}%`,
            `background:${colors[Math.floor(Math.random() * colors.length)]}`,
            `animation-duration:${Math.random() * 24 + 14}s`,
            `animation-delay:${Math.random() * -20}s`,
        ].join(';');
        container.appendChild(p);
    }
})();

// ── DOM refs ──────────────────────────────────────────────────────────────
const queryInput = document.getElementById('queryInput');
const queryCounter = document.getElementById('queryCounter');
const personaInput = document.getElementById('personaInput');
const generateBtn = document.getElementById('generateBtn');
const answerPanel = document.getElementById('answerPanel');
const loaderContainer = document.getElementById('loaderContainer');
const answerContent = document.getElementById('answerContent');
const answerText = document.getElementById('answerText');
const answerPersonaBadge = document.getElementById('answerPersonaBadge');
const answerMeta = document.getElementById('answerMeta');
const sourcesSection = document.getElementById('sourcesSection');
const sourcesList = document.getElementById('sourcesList');
const errorContainer = document.getElementById('errorContainer');
const errorText = document.getElementById('errorText');
const copyBtn = document.getElementById('copyBtn');
const newQueryBtn = document.getElementById('newQueryBtn');

// Loader step els
const stepEls = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3'),
];

// ── Char counter ──────────────────────────────────────────────────────────
queryInput.addEventListener('input', () => {
    const len = queryInput.value.length;
    queryCounter.textContent = `${len} / 1000`;
    if (len > 900) queryCounter.style.color = '#FF6B00';
    else queryCounter.style.color = '';
    if (len > 1000) queryInput.value = queryInput.value.slice(0, 1000);
});

// ── Persona chips ─────────────────────────────────────────────────────────
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        personaInput.value = chip.dataset.persona;
    });
});

personaInput.addEventListener('input', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
});

// ── Loader step sequencer ─────────────────────────────────────────────────
let _loaderTimer = null;

function startLoader() {
    stepEls.forEach(s => { s.className = 'step'; });
    stepEls[0].classList.add('active');
    let idx = 0;
    _loaderTimer = setInterval(() => {
        if (idx < stepEls.length) {
            if (idx > 0) stepEls[idx - 1].classList.replace('active', 'done');
            stepEls[idx].classList.add('active');
            idx++;
        }
    }, 1800);
}

function stopLoader() {
    clearInterval(_loaderTimer);
    stepEls.forEach(s => s.className = 'step');
}

// ── Show / hide panels ────────────────────────────────────────────────────
function showPanel(state) {
    // state: 'loading' | 'answer' | 'error' | 'hidden'
    answerPanel.hidden = (state === 'hidden');
    loaderContainer.hidden = (state !== 'loading');
    answerContent.hidden = (state !== 'answer');
    errorContainer.hidden = (state !== 'error');

    if (state === 'loading') startLoader();
    else stopLoader();

    if (state !== 'hidden') {
        answerPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ── Generate ──────────────────────────────────────────────────────────────
async function handleGenerate() {
    const query = queryInput.value.trim();
    const persona = personaInput.value.trim() || 'a knowledgeable enterprise assistant';

    if (!query) {
        queryInput.focus();
        queryInput.style.borderColor = '#FF5555';
        setTimeout(() => { queryInput.style.borderColor = ''; }, 1500);
        return;
    }

    generateBtn.disabled = true;
    showPanel('loading');

    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, persona }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            throw new Error(data.error || `Server error ${res.status}`);
        }

        renderAnswer(data, persona);
        showPanel('answer');

    } catch (err) {
        errorText.textContent = err.message || 'An unexpected error occurred. Please try again.';
        showPanel('error');
    } finally {
        generateBtn.disabled = false;
    }
}

function renderAnswer(data, persona) {
    // Persona badge
    answerPersonaBadge.textContent = `🎭 ${persona}`;

    // Meta
    const segments = data.segments_found ?? 0;
    const latency = data.search_latency ?? 0;
    answerMeta.innerHTML = `
    <span>${segments} segment${segments !== 1 ? 's' : ''} retrieved</span>
    <span>Search ${latency}s</span>
  `;

    // Answer text
    answerText.textContent = data.answer || 'No answer generated.';

    // Sources
    sourcesList.innerHTML = '';
    const sources = data.sources || [];
    if (sources.length > 0) {
        sources.forEach((src, i) => {
            const li = document.createElement('li');
            li.className = 'source-item';
            const label = src.title || src.source_url || `Source ${i + 1}`;
            const href = src.source_url || '#';
            li.innerHTML = `
        <span class="source-dot">◆</span>
        <a href="${href}" target="_blank" rel="noopener noreferrer" title="${label}">${label}</a>
      `;
            sourcesList.appendChild(li);
        });
        sourcesSection.hidden = false;
    } else {
        sourcesSection.hidden = true;
    }
}

// ── Copy button ───────────────────────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
    const txt = answerText.textContent;
    try {
        await navigator.clipboard.writeText(txt);
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => { copyBtn.innerHTML = '<span>📋</span> Copy'; }, 2000);
    } catch {
        copyBtn.textContent = 'Failed';
        setTimeout(() => { copyBtn.innerHTML = '<span>📋</span> Copy'; }, 2000);
    }
});

// ── New query button ──────────────────────────────────────────────────────
newQueryBtn.addEventListener('click', () => {
    showPanel('hidden');
    queryInput.value = '';
    queryInput.dispatchEvent(new Event('input'));
    queryInput.focus();
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
});

// ── Generate button click ─────────────────────────────────────────────────
generateBtn.addEventListener('click', handleGenerate);

// ── Ctrl/Cmd + Enter to generate ─────────────────────────────────────────
queryInput.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerate();
});
