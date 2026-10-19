(() => {
  const KEY = 'goonies-team-stars-v1';
  const WEEK_KEY = 'goonies-team-week-v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }
  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
  function loadWeek() {
    try { return JSON.parse(localStorage.getItem(WEEK_KEY) || '{}'); } catch { return {}; }
  }
  function saveWeek(data) {
    localStorage.setItem(WEEK_KEY, JSON.stringify(data));
  }

  function starTotal(data) {
    return Object.values(data).filter(Boolean).length;
  }

  function updateBanks() {
    const data = load();
    const n = starTotal(data);
    document.querySelectorAll('[data-star-count]').forEach((el) => {
      el.textContent = String(n);
    });
  }

  function setDone(btn, on) {
    btn.classList.toggle('is-done', on);
    const kind = btn.dataset.kind || 'skill';
    btn.textContent = on
      ? (kind === 'home' ? '⭐ Home drill done!' : '⭐ You practiced it!')
      : (kind === 'home' ? '🏠 I did the home drill!' : '✨ I practiced it!');
  }

  function bindPracticeButtons() {
    document.querySelectorAll('[data-practice]').forEach((btn) => {
      const id = btn.dataset.practice;
      const data = load();
      setDone(btn, !!data[id]);
      btn.addEventListener('click', () => {
        const d = load();
        d[id] = !d[id];
        save(d);
        setDone(btn, !!d[id]);
        updateBanks();
        updateHomeRings();
      });
    });
  }

  function ringSvg(pct, accent) {
    const r = 14;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct);
    return `<svg viewBox="0 0 36 36" aria-hidden="true">
      <circle class="bg" cx="18" cy="18" r="${r}"></circle>
      <circle class="fg" cx="18" cy="18" r="${r}"
        stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
        style="stroke:${accent || '#ff6b35'}"></circle>
    </svg><span class="pct">${Math.round(pct * 100)}%</span>`;
  }

  function updateHomeRings() {
    const data = load();
    document.querySelectorAll('[data-skill-progress]').forEach((el) => {
      const id = el.dataset.skillProgress;
      const skillDone = !!data['skill:' + id];
      const homeDone = !!data['home:' + id];
      const pct = (skillDone ? 0.5 : 0) + (homeDone ? 0.5 : 0);
      const accent = el.dataset.accent || '#ff6b35';
      el.innerHTML = ringSvg(pct, accent);
      el.title = pct === 1 ? 'Complete!' : pct === 0.5 ? 'Halfway' : 'Not started';
    });
  }

  function bindWeekChecklist() {
    const box = document.getElementById('week-checklist');
    if (!box) return;
    const week = loadWeek();
    box.querySelectorAll('input[data-day]').forEach((input) => {
      const day = input.dataset.day;
      input.checked = !!week[day];
      input.addEventListener('change', () => {
        const w = loadWeek();
        w[day] = input.checked;
        saveWeek(w);
        // also award a soft star key for the day
        const d = load();
        const key = 'weekday:' + day;
        d[key] = input.checked;
        save(d);
        updateBanks();
      });
    });
  }

  function bindReset() {
    document.querySelectorAll('[data-reset-stars]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!confirm('Reset all stars and the 7-day checklist on this phone?')) return;
        localStorage.removeItem(KEY);
        localStorage.removeItem(WEEK_KEY);
        updateBanks();
        updateHomeRings();
        document.querySelectorAll('[data-practice]').forEach((b) => setDone(b, false));
        document.querySelectorAll('#week-checklist input').forEach((i) => { i.checked = false; });
      });
    });
  }

  // nav current
  const file = (location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === file) a.setAttribute('aria-current', 'page');
    if (file.match(/\.html$/) && location.pathname.includes('/skills/') && href === 'index.html' && a.textContent.trim() === 'Skills') {
      a.setAttribute('aria-current', 'page');
    }
  });

  updateBanks();
  bindPracticeButtons();
  updateHomeRings();
  bindWeekChecklist();
  bindReset();
})();
