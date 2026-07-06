const ACCENT = '#6c63ff';
const DIM = '#9aa0ac';

const $ = (id) => document.getElementById(id);

async function load() {
  try {
    const res = await fetch('./data/stats.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`stats.json returned ${res.status}`);
    render(await res.json());
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

  const since = new Date(s.createdAt).getFullYear();
  $('followers-badge').textContent = `${format(s.followers)} followers`;
  $('repos-badge').textContent = `${format(s.totalRepos)} repos`;
  $('since-badge').textContent = `since ${since}`;

  renderStatTiles(s);
  renderTimeline(s.timeline);
  renderLanguages(s.languages);
  renderRepos(s.topRepos);

  $('updated').textContent = `Updated ${new Date(s.generatedAt).toLocaleString()}`;
  document.title = `${s.name || s.login} · GitHub Stats`;
}

function renderStatTiles(s) {
  const tiles = [
    { label: 'Total Stars', value: s.totalStars, accent: true },
    { label: `Total Commits (${s.commitsYearLabel})`, value: s.totalCommits },
    { label: 'Total PRs', value: s.totalPRs },
    { label: 'Total Issues', value: s.totalIssues },
    { label: 'Total Forks', value: s.totalForks },
    { label: 'Contributions this year', value: s.contributionsThisYear, accent: true },
  ];
  const grid = $('stat-grid');
  grid.innerHTML = '';
  tiles.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'stat-tile';
    el.style.animationDelay = `${i * 70}ms`;
    el.innerHTML = `<div class="value ${t.accent ? 'accent' : ''}">${format(t.value)}</div><div class="label">${t.label}</div>`;
    grid.appendChild(el);
  });
}

function renderTimeline(timeline) {
  const data = timeline?.monthly || [];
  new Chart($('timelineChart'), {
    type: 'line',
    data: {
      labels: data.map((d) => d.month.slice(5)),
      datasets: [
        {
          label: 'Contributions',
          data: data.map((d) => d.count),
          borderColor: ACCENT,
          backgroundColor: withAlpha(ACCENT, 0.18),
          fill: true,
          tension: 0.35,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    },
    options: baseChartOptions({ yGrid: true }),
  });
}

function renderLanguages(langs) {
  const top = (langs || []).slice(0, 7);
  new Chart($('langChart'), {
    type: 'doughnut',
    data: {
      labels: top.map((l) => l.name),
      datasets: [
        {
          data: top.map((l) => l.size),
          backgroundColor: top.map((l) => l.color || '#858585'),
          borderColor: '#161b22',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: '62%',
      plugins: {
        legend: { position: 'right', labels: { color: DIM, boxWidth: 12, padding: 10 } },
      },
    },
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
      <div class="repo-desc">${escapeHtml(r.description || '')}</div>
      <div class="repo-foot">
        ${langDot}
        <span>★ ${format(r.stars)}</span>
        <span>⑂ ${format(r.forks)}</span>
      </div>`;
    grid.appendChild(a);
  });
}

function baseChartOptions({ yGrid } = {}) {
  return {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: DIM }, grid: { display: false } },
      y: {
        ticks: { color: DIM },
        grid: { color: yGrid ? 'rgba(255,255,255,0.06)' : 'transparent' },
        beginAtZero: true,
      },
    },
  };
}

function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
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
