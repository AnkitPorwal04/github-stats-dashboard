const ACCENT = '#6c63ff';
const ACCENT3 = '#22d3ee';
const DIM = '#97a0b0';
const REPO_URL = 'https://github.com/AnkitPorwal04/github-stats-dashboard';

const $ = (id) => document.getElementById(id);

const ICONS = {
  star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
  commit: 'M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
  pr: 'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z',
  issue: 'M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z',
  fork: 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z',
  flame: 'M9.533.753V.752c.217 2.385 1.463 3.626 2.653 4.81C13.216 6.62 14.315 7.7 14.315 10c0 3.364-2.766 6-6.315 6-3.548 0-6.313-2.636-6.313-6 0-1.098.238-2.052.63-2.86.377.293.762.548 1.13.756.28-.393.512-.792.7-1.198C4.85 4.66 5.9 3.68 6.35 3.16c.35.24.7.5 1.05.78.7-.75 1.4-1.63 2.13-3.19Z',
  people: 'M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5Z',
};

function svgIcon(name) {
  return `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
}

async function load() {
  try {
    const res = await fetch('./data/stats.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`stats.json returned ${res.status}`);
    render(await res.json());
    setupReveal();
  } catch (err) {
    const box = $('error');
    box.textContent =
      'Could not load ./data/stats.json — run the workflow (or `npm run build`) to generate it. ' + err.message;
    box.classList.remove('hidden');
    console.error(err);
  }
}

function render(s) {
  $('avatar').src = s.avatarUrl || '';
  $('avatar').alt = `${s.name || s.login} avatar`;
  $('name').textContent = s.name || s.login;
  const login = $('login');
  login.textContent = '@' + s.login;
  login.href = `https://github.com/${s.login}`;
  $('bio').textContent = s.bio || '';
  $('repo-link').href = REPO_URL;

  const since = new Date(s.createdAt).getFullYear();
  $('followers-badge').textContent = `${format(s.followers)} followers`;
  $('following-badge').textContent = `${format(s.following)} following`;
  $('repos-badge').textContent = `${format(s.totalRepos)} repos`;
  $('since-badge').textContent = `since ${since}`;

  const streak = computeStreak(s.timeline?.days || []);

  renderStatTiles(s, streak);
  renderHeatmap(s.timeline?.days || []);
  renderTimeline(s.timeline);
  renderLanguages(s.languages);
  renderRepos(s.topRepos);
  setupCopy(s);

  $('updated').textContent = `Updated ${new Date(s.generatedAt).toLocaleString()}`;
  document.title = `${s.name || s.login} · GitHub Stats`;
}

function renderStatTiles(s, streak) {
  const tiles = [
    { icon: 'star', label: 'Total Stars', value: s.totalStars, accent: true },
    { icon: 'commit', label: `Commits (${s.commitsYearLabel})`, value: s.totalCommits },
    { icon: 'flame', label: 'Current Streak', value: streak.current, suffix: ' d', accent: true },
    { icon: 'flame', label: 'Longest Streak', value: streak.longest, suffix: ' d' },
    { icon: 'pr', label: 'Total PRs', value: s.totalPRs },
    { icon: 'issue', label: 'Total Issues', value: s.totalIssues },
    { icon: 'fork', label: 'Total Forks', value: s.totalForks },
    { icon: 'people', label: 'Contributions (yr)', value: s.contributionsThisYear, accent: true },
  ];
  const grid = $('stat-grid');
  grid.innerHTML = '';
  tiles.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'stat-tile' + (t.accent ? ' accent' : '');
    el.style.transitionDelay = `${i * 45}ms`;
    el.innerHTML = `
      <div class="stat-top">${svgIcon(t.icon)}<span>${t.label}</span></div>
      <div class="value" data-target="${t.value || 0}" data-suffix="${t.suffix || ''}">0${t.suffix || ''}</div>`;
    grid.appendChild(el);
  });
  requestAnimationFrame(() => countUp(grid.querySelectorAll('.value')));
}

function renderHeatmap(days) {
  const el = $('heatmap');
  el.innerHTML = '';
  if (!days.length) return;
  const max = Math.max(...days.map((d) => d.contributionCount), 1);
  const level = (c) => (c === 0 ? 0 : c >= max * 0.75 ? 4 : c >= max * 0.5 ? 3 : c >= max * 0.25 ? 2 : 1);
  const first = new Date(days[0].date);
  const pad = first.getUTCDay();
  for (let i = 0; i < pad; i++) {
    const s = document.createElement('span');
    s.className = 'hm-cell l0';
    s.style.visibility = 'hidden';
    el.appendChild(s);
  }
  let total = 0;
  for (const d of days) {
    total += d.contributionCount;
    const s = document.createElement('span');
    s.className = `hm-cell l${level(d.contributionCount)}`;
    s.title = `${d.date}: ${d.contributionCount} contribution${d.contributionCount === 1 ? '' : 's'}`;
    el.appendChild(s);
  }
  $('heatmap-total').textContent = `${format(total)} in the last year`;
}

function computeStreak(days) {
  let longest = 0, run = 0, current = 0;
  for (const d of days) {
    if (d.contributionCount > 0) { run++; longest = Math.max(longest, run); }
    else run = 0;
  }
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) current++;
    else break;
  }
  return { longest, current };
}

function renderTimeline(timeline) {
  const data = timeline?.monthly || [];
  const ctx = $('timelineChart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(108,99,255,0.4)');
  grad.addColorStop(1, 'rgba(108,99,255,0.02)');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((d) => d.month.slice(2)),
      datasets: [{
        data: data.map((d) => d.count),
        borderColor: ACCENT,
        backgroundColor: grad,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: ACCENT3,
        borderWidth: 2.5,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index' } },
      scales: {
        x: { ticks: { color: DIM, font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: DIM, font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
      },
    },
  });
}

function renderLanguages(langs) {
  const top = (langs || []).slice(0, 6);
  const total = top.reduce((a, l) => a + l.size, 0) || 1;
  new Chart($('langChart'), {
    type: 'doughnut',
    data: {
      labels: top.map((l) => l.name),
      datasets: [{
        data: top.map((l) => l.size),
        backgroundColor: top.map((l) => l.color || '#858585'),
        borderColor: 'rgba(10,12,18,0.9)',
        borderWidth: 3,
        hoverOffset: 6,
      }],
    },
    options: { responsive: true, cutout: '68%', plugins: { legend: { display: false } } },
  });

  const list = $('lang-list');
  list.innerHTML = '';
  top.forEach((l, i) => {
    const pct = ((l.size / total) * 100).toFixed(1);
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="lang-row">
        <span class="lang-dot" style="background:${l.color || '#858585'}"></span>
        <span class="lang-name">${escapeHtml(l.name)}</span>
        <span class="lang-pct">${pct}%</span>
      </div>
      <div class="lang-bar"><span style="background:${l.color || '#858585'}"></span></div>`;
    list.appendChild(li);
    requestAnimationFrame(() =>
      setTimeout(() => { li.querySelector('.lang-bar > span').style.width = pct + '%'; }, 120 + i * 90));
  });
}

function renderRepos(repos) {
  const grid = $('repo-grid');
  grid.innerHTML = '';
  (repos || []).forEach((r) => {
    const a = document.createElement('a');
    a.className = 'repo';
    a.href = r.url;
    a.target = '_blank';
    a.rel = 'noopener';
    const langDot = r.language
      ? `<span><span class="lang-dot" style="background:${r.languageColor || '#858585'}"></span>${escapeHtml(r.language)}</span>`
      : '';
    a.innerHTML = `
      <div class="repo-name">${escapeHtml(r.name)}</div>
      <div class="repo-desc">${escapeHtml(r.description || 'No description')}</div>
      <div class="repo-foot">${langDot}<span>★ ${format(r.stars)}</span><span>⑂ ${format(r.forks)}</span></div>`;
    grid.appendChild(a);
  });
}

function setupCopy(s) {
  const btn = $('copy-embed');
  if (!btn) return;
  const embed = `<div align="center">
  <img height="200" alt="${s.name || s.login}'s GitHub stats" src="https://ankitporwal04.github.io/github-stats-dashboard/assets/stats.svg" />
  <img height="200" alt="Most used languages" src="https://ankitporwal04.github.io/github-stats-dashboard/assets/top-langs.svg" />
</div>`;
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(embed); toast('Embed markdown copied ✓'); }
    catch { toast('Copy failed — select manually'); }
  });
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.classList.add('hidden'), 250); }, 1900);
}

function countUp(nodes) {
  nodes.forEach((node) => {
    const target = Number(node.dataset.target) || 0;
    const suffix = node.dataset.suffix || '';
    const dur = 900;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function setupReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}

function format(n) {
  if (n == null) return '0';
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return String(n);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

load();
