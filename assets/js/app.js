(() => {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const file = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === file || (file === 'index.html' && href === 'index.html') ||
        (file.startsWith('skill') && href === 'index.html' && a.dataset.skills)) {
      // mark home only for index
    }
    if (href === file) a.setAttribute('aria-current', 'page');
  });

  // Skill page: /skills/foo.html or skill.html?id=
  const skillRoot = document.getElementById('skill-root');
  if (!skillRoot) return;

  const params = new URLSearchParams(location.search);
  let id = params.get('id');
  if (!id) {
    const m = location.pathname.match(/\/skills\/([^/]+?)(?:\.html)?\/?$/);
    if (m) id = m[1];
  }
  if (!id) {
    skillRoot.innerHTML = '<p class="card">Skill not found. <a href="../index.html">Back home</a></p>';
    return;
  }

  const dataUrl = location.pathname.includes('/skills/') ? '../data/skills.json' : 'data/skills.json';
  fetch(dataUrl, { cache: 'no-store' })
    .then((r) => r.json())
    .then((data) => {
      const skill = (data.skills || []).find((s) => s.id === id);
      if (!skill) {
        skillRoot.innerHTML = '<p class="card">Skill not found. <a href="../index.html">Back home</a></p>';
        return;
      }
      document.title = `${skill.name} · THE GOONIES`;
      skillRoot.innerHTML = renderSkill(skill);
    })
    .catch(() => {
      skillRoot.innerHTML = '<p class="card">Could not load skills data.</p>';
    });

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSkill(s) {
    const steps = (s.steps || []).map((t) => `<li>${esc(t)}</li>`).join('');
    const mistakes = (s.mistakes || [])
      .map(
        (m) => `<div class="mistake"><div class="bad">${esc(m.bad)}</div><div class="fix">${esc(m.fix)}</div></div>`
      )
      .join('');
    const cd = s.coach_drill || {};
    const hd = s.home_drill || {};
    const videos = (s.videos || [])
      .map(
        (v) => `
      <a class="video-card" href="${esc(v.url)}" target="_blank" rel="noopener">
        <img class="video-thumb" src="${esc(v.thumb)}" alt="" loading="lazy" width="320" height="180">
        <div class="video-info">
          <strong>${esc(v.title)}</strong>
          <span class="ch">${esc(v.channel || '')}</span>
          <span class="yt">▶ YouTube</span>
        </div>
      </a>`
      )
      .join('');

    return `
      <a class="back-link" href="../index.html">← All skills</a>
      <header class="card" style="display:flex;gap:0.85rem;align-items:flex-start">
        <div style="font-size:2.4rem;line-height:1">${s.emoji || '⚾'}</div>
        <div>
          <p class="muted" style="margin:0">${esc(s.category || '')}</p>
          <h1 style="margin:0.15rem 0;font-size:1.75rem">${esc(s.name)}</h1>
        </div>
      </header>

      <div class="cue-banner">
        <span class="big">${esc(s.cue)}</span>
        <span><strong>Cue word</strong> — say only this while they move.</span>
      </div>

      <section class="card">
        <h2>Why it matters</h2>
        <p style="margin:0;font-weight:600">${esc(s.why)}</p>
      </section>

      <section class="card">
        <h2>How to</h2>
        <ol class="steps">${steps}</ol>
      </section>

      <section class="card">
        <h2>Common mistakes</h2>
        ${mistakes}
      </section>

      <section class="card">
        <h2>Coach station drill</h2>
        <div class="drill-box">
          <span class="lbl">Practice · ${esc(cd.time || '')}</span>
          <strong>${esc(cd.name || '')}</strong>
          <p style="margin:0.4rem 0 0"><strong>Setup:</strong> ${esc(cd.setup || '')}</p>
          <p style="margin:0.4rem 0 0"><strong>How:</strong> ${esc(cd.how || '')}</p>
        </div>
      </section>

      <section class="card">
        <h2>10-minute at-home drill</h2>
        <div class="drill-box home">
          <span class="lbl">Home · ${esc(hd.time || '')}</span>
          <strong>${esc(hd.name || '')}</strong>
          <p style="margin:0.4rem 0 0"><strong>Gear:</strong> ${esc(hd.gear || '')}</p>
          <p style="margin:0.4rem 0 0"><strong>How:</strong> ${esc(hd.how || '')}</p>
        </div>
      </section>

      <section class="card">
        <h2>Level up</h2>
        <div class="level-box">🚀 ${esc(s.level_up || '')}</div>
      </section>

      ${
        videos
          ? `<section class="card"><h2>Watch</h2><div class="videos">${videos}</div></section>`
          : ''
      }
    `;
  }
})();
