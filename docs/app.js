const ACCENT = '#6C63FF';
const ACCENT_2 = '#9F7AEA';
const ACCENT_3 = '#22d3ee';
const DIM = '#97a0b0';
const TEXT = '#c9d1d9';
const REPO_URL = 'https://github.com/AnkitPorwal04/github-stats-dashboard';

const RANGE_DAYS = { '30D': 30, '90D': 90, '1Y': Infinity };
const DEFAULT_RANGE = '30D';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const $ = (id) => document.getElementById(id);
const hasChart = () => typeof window.Chart !== 'undefined';
const reduceMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  stats: null,
  days: [],
  repos: [],
  repoEls: [],
  range: DEFAULT_RANGE,
  renderedRange: null,
  sort: 'stars',
  charts: { timeline: null, lang: null, rhythm: null },
};

const ICONS = {
  star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
  commit: 'M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
  pr: 'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z',
  issue: 'M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z',
  fork: 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z',
  flame: 'M9.533.753V.752c.217 2.385 1.463 3.626 2.653 4.81C13.216 6.62 14.315 7.7 14.315 10c0 3.364-2.766 6-6.315 6-3.548 0-6.313-2.636-6.313-6 0-1.098.238-2.052.63-2.86.377.293.762.548 1.13.756.28-.393.512-.792.7-1.198C4.85 4.66 5.9 3.68 6.35 3.16c.35.24.7.5 1.05.78.7-.75 1.4-1.63 2.13-3.19Z',
  people: 'M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5Z',
  repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z',
  calendar: 'M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5Zm10.75-4H2.75a.25.25 0 0 0-.25.25V6h11V3.75a.25.25 0 0 0-.25-.25Z',
  pulse: 'M6 2c.306 0 .582.187.696.471L10 10.731l1.304-3.26A.751.751 0 0 1 12 7h3.25a.75.75 0 0 1 0 1.5h-2.742l-1.812 4.528a.751.751 0 0 1-1.392 0L6 4.77 4.696 8.03A.75.75 0 0 1 4 8.5H.75a.75.75 0 0 1 0-1.5h2.742l1.812-4.529A.751.751 0 0 1 6 2Z',
  clock: 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z',
};

function svgIcon(name) {
  const path = ICONS[name] || ICONS.pulse;
  return `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="${path}"/></svg>`;
}

function format(n) {
  if (n == null || Number.isNaN(Number(n))) return '0';
  const v = Number(n);
  if (v >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k';
  return String(v);
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Parses 'YYYY-MM-DD' as a UTC date (avoids local-timezone off-by-one).
function parseDay(key) {
  const d = new Date(String(key).slice(0, 10) + 'T00:00:00Z');
  return Number.isNaN(d.getTime()) ? null : d;
}

function shortDate(key) {
  const d = parseDay(key);
  if (!d) return String(key || '');
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function longDate(key) {
  const d = parseDay(key);
  if (!d) return String(key || '');
  const dow = WEEKDAYS[(d.getUTCDay() + 6) % 7];
  return `${dow}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function relativeTime(input) {
  const t = input instanceof Date ? input : new Date(input);
  if (!t || Number.isNaN(t.getTime())) return null;
  const secs = Math.round((Date.now() - t.getTime()) / 1000);
  const abs = Math.abs(secs);
  const unit = (n, label) => `${n} ${label}${n === 1 ? '' : 's'}`;
  let phrase;
  if (abs < 45) return secs >= 0 ? 'just now' : 'in a moment';
  if (abs < 3600) phrase = unit(Math.round(abs / 60), 'minute');
  else if (abs < 86400) phrase = unit(Math.round(abs / 3600), 'hour');
  else if (abs < 2592000) phrase = unit(Math.round(abs / 86400), 'day');
  else if (abs < 31536000) phrase = unit(Math.round(abs / 2592000), 'month');
  else phrase = unit(Math.round(abs / 31536000), 'year');
  return secs >= 0 ? `${phrase} ago` : `in ${phrase}`;
}

function safe(label, fn) {
  try { return fn(); } catch (err) { console.error(`[dashboard] ${label} failed:`, err); return null; }
}

async function load() {
  try {
    const res = await fetch('./data/stats.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`stats.json returned ${res.status}`);
    render(await res.json());
    setupReveal();
  } catch (err) {
    const box = $('error');
    if (box) {
      box.textContent =
        'Could not load ./data/stats.json — run the workflow (or `npm run build`) to generate it. ' + err.message;
      box.classList.remove('hidden');
    }
    console.error(err);
  }
}

function normalizeDays(raw) {
  if (!Array.isArray(raw)) return [];
  const clean = raw
    .filter((d) => d && typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d.date))
    .map((d) => ({ date: d.date.slice(0, 10), count: Math.max(0, Number(d.contributionCount) || 0) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  // The calendar can run to the end of the current week — trim future days so
  // "last 30 days" really ends today. Fall back if that would empty the array.
  const today = new Date().toISOString().slice(0, 10);
  const upToToday = clean.filter((d) => d.date <= today);
  return upToToday.length ? upToToday : clean;
}

function normalizeRepos(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(Boolean).map((r, i) => ({
    idx: i,
    name: r.name || 'untitled',
    description: r.description || '',
    url: r.url || '#',
    stars: Number(r.stars) || 0,
    forks: Number(r.forks) || 0,
    pushedAt: r.pushedAt || null,          // absent in the pre-upgrade schema
    language: r.language || null,
    languageColor: r.languageColor || null,
  }));
}

function render(s) {
  state.stats = s || {};
  state.days = normalizeDays(s?.timeline?.days);
  state.repos = normalizeRepos(s?.topRepos);
  state.renderedRange = null;
  Object.keys(state.charts).forEach((key) => {
    const chart = state.charts[key];
    if (chart && typeof chart.destroy === 'function') chart.destroy();
    state.charts[key] = null;
  });

  safe('hero', () => renderHero(state.stats));
  const metrics = computeDayMetrics(state.days);
  safe('tiles', () => renderStatTiles(state.stats));
  safe('streaks', () => renderStreaks(metrics));
  safe('heatmap', () => renderHeatmap(state.days));
  safe('timeline', () => initTimelineChart());
  safe('range-control', () => setupRangeControl());
  safe('rhythm', () => renderRhythmChart(state.days));
  safe('languages', () => renderLanguages(state.stats.languages));
  safe('repos', () => renderRepos(state.repos));
  safe('sort-control', () => setupSortControl());
  safe('copy', () => setupCopy(state.stats));
  safe('refreshed', () => setupRefreshedClock(state.stats.generatedAt));

  document.title = `${state.stats.name || state.stats.login || 'GitHub'} · GitHub Stats`;
}

function renderHero(s) {
  const avatar = $('avatar');
  if (avatar) {
    avatar.src = s.avatarUrl || '';
    avatar.alt = `${s.name || s.login || 'user'} avatar`;
  }
  if ($('name')) $('name').textContent = s.name || s.login || 'Unknown user';
  const login = $('login');
  if (login && s.login) {
    login.textContent = '@' + s.login;
    login.href = `https://github.com/${s.login}`;
  }
  if ($('bio')) $('bio').textContent = s.bio || '';
  if ($('repo-link')) $('repo-link').href = REPO_URL;

  const year = s.createdAt ? new Date(s.createdAt).getFullYear() : null;
  setText('followers-badge', `${format(s.followers)} followers`);
  setText('following-badge', `${format(s.following)} following`);
  setText('repos-badge', `${format(s.totalRepos)} repos`);
  setText('since-badge', year && !Number.isNaN(year) ? `since ${year}` : 'GitHub');
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

let refreshTimer = null;

function setupRefreshedClock(generatedAt) {
  const el = $('refreshed');
  if (refreshTimer) clearInterval(refreshTimer);
  const stamp = generatedAt ? new Date(generatedAt) : null;
  const valid = stamp && !Number.isNaN(stamp.getTime());
  const tick = () => {
    const rel = valid ? relativeTime(stamp) : null;
    if (el) el.textContent = rel ? `Data refreshed ${rel}` : 'Data refresh pending';
    setText('updated', valid ? `Updated ${stamp.toLocaleString()}` : 'Updated —');
  };
  tick();
  if (valid) {
    const pill = $('live-pill');
    if (pill) pill.title = `Last generated ${stamp.toLocaleString()}`;
    refreshTimer = setInterval(tick, 60000);
  }
}

function sumRange(days, range) {
  const n = RANGE_DAYS[range] || RANGE_DAYS[DEFAULT_RANGE];
  return days.slice(-n).reduce((a, d) => a + d.count, 0);
}

function renderStatTiles(s) {
  const grid = $('stat-grid');
  if (!grid) return;
  const tiles = [
    { icon: 'star', label: 'Total Stars', value: s.totalStars, accent: true },
    { icon: 'commit', label: `Commits (${s.commitsYearLabel || '—'})`, value: s.totalCommits },
    { icon: 'pr', label: 'Total PRs', value: s.totalPRs },
    { icon: 'issue', label: 'Total Issues', value: s.totalIssues },
    { icon: 'fork', label: 'Total Forks', value: s.totalForks },
    { icon: 'repo', label: 'Repositories', value: s.totalRepos },
    { icon: 'calendar', label: 'Contributions (yr)', value: s.contributionsThisYear, accent: true },
    {
      icon: 'pulse',
      label: `Contributions · ${state.range}`,
      value: sumRange(state.days, state.range),
      accent: true,
      id: 'tile-range',
    },
  ];
  grid.innerHTML = '';
  tiles.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'stat-tile' + (t.accent ? ' accent' : '');
    if (t.id) el.id = t.id;
    el.style.transitionDelay = `${i * 45}ms`;
    el.innerHTML = `
      <div class="stat-top">${svgIcon(t.icon)}<span class="stat-label">${escapeHtml(t.label)}</span></div>
      <div class="value" data-target="${Number(t.value) || 0}" data-suffix="${t.suffix || ''}">0${t.suffix || ''}</div>`;
    grid.appendChild(el);
  });
  requestAnimationFrame(() => countUp(grid.querySelectorAll('.value')));
}

function updateRangeTile() {
  const tile = $('tile-range');
  const total = sumRange(state.days, state.range);
  if (tile) {
    const label = tile.querySelector('.stat-label');
    if (label) label.textContent = `Contributions · ${state.range}`;
    const value = tile.querySelector('.value');
    if (value) {
      value.dataset.target = String(total);
      countUp([value]);
    }
    tile.classList.remove('flash');
    void tile.offsetWidth;
    tile.classList.add('flash');
  }
  setText('range-total', `${format(total)} contributions`);
}

function computeDayMetrics(days) {
  let longest = 0;
  let run = 0;
  let current = 0;
  let busiest = null;
  for (const d of days) {
    if (d.count > 0) { run++; if (run > longest) longest = run; } else run = 0;
    if (!busiest || d.count > busiest.count) busiest = d;
  }
  // Count back from the most recent day. A contribution-free *today* does not
  // break the streak yet (GitHub behaves the same way).
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  for (; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else break;
  }
  return { current, longest, busiest };
}

function renderStreaks(m) {
  const grid = $('streak-grid');
  if (!grid) return;
  const cards = [
    { icon: 'flame', label: 'Current streak', value: m.current, suffix: ' d', sub: m.current > 0 ? 'keep it alive' : 'start one today' },
    { icon: 'pulse', label: 'Longest streak', value: m.longest, suffix: ' d', sub: 'personal best' },
    {
      icon: 'calendar',
      label: 'Busiest day',
      value: m.busiest ? m.busiest.count : 0,
      suffix: '',
      sub: m.busiest && m.busiest.count > 0 ? longDate(m.busiest.date) : 'no activity yet',
    },
  ];
  grid.innerHTML = '';
  cards.forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'streak-card';
    el.style.transitionDelay = `${i * 60}ms`;
    el.innerHTML = `
      <div class="streak-icon">${svgIcon(c.icon)}</div>
      <div class="streak-body">
        <div class="streak-label">${escapeHtml(c.label)}</div>
        <div class="value" data-target="${Number(c.value) || 0}" data-suffix="${c.suffix}">0${c.suffix}</div>
        <div class="streak-sub">${escapeHtml(c.sub)}</div>
      </div>`;
    grid.appendChild(el);
  });
  requestAnimationFrame(() => countUp(grid.querySelectorAll('.value')));
}

function renderHeatmap(days) {
  const el = $('heatmap');
  if (!el) return;
  el.innerHTML = '';
  if (!days.length) {
    setText('heatmap-total', 'no contribution data');
    return;
  }
  // Percentile ramp keeps the map readable even with extreme outlier days.
  const nonZero = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b);
  const q = (p) => (nonZero.length ? nonZero[Math.min(nonZero.length - 1, Math.floor(nonZero.length * p))] : 1);
  const t1 = q(0.25);
  const t2 = q(0.55);
  const t3 = q(0.8);
  const level = (c) => (c === 0 ? 0 : c <= t1 ? 1 : c <= t2 ? 2 : c <= t3 ? 3 : 4);

  const first = parseDay(days[0].date);
  const pad = first ? first.getUTCDay() : 0;
  for (let i = 0; i < pad; i++) {
    const s = document.createElement('span');
    s.className = 'hm-cell l0 hm-pad';
    el.appendChild(s);
  }
  let total = 0;
  for (const d of days) {
    total += d.count;
    const cell = document.createElement('span');
    cell.className = `hm-cell l${level(d.count)}`;
    cell.dataset.date = d.date;
    cell.dataset.count = String(d.count);
    el.appendChild(cell);
  }
  setText('heatmap-total', `${format(total)} in the last year`);
  setupHeatmapTooltip(el);
}

let tooltipBound = false;

function setupHeatmapTooltip(grid) {
  const tip = $('hm-tooltip');
  if (!tip || tooltipBound) return;
  tooltipBound = true;

  const show = (cell) => {
    const count = Number(cell.dataset.count) || 0;
    tip.innerHTML =
      `<strong>${count} contribution${count === 1 ? '' : 's'}</strong>` +
      `<span>${escapeHtml(longDate(cell.dataset.date))}</span>`;
    tip.classList.add('show');
    tip.setAttribute('aria-hidden', 'false');
    place(cell);
  };

  const place = (cell) => {
    const r = cell.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    let left = r.left + r.width / 2 - tr.width / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - tr.width - 10));
    let top = r.top - tr.height - 10;
    if (top < 8) top = r.bottom + 10;
    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  };

  const hide = () => {
    tip.classList.remove('show');
    tip.setAttribute('aria-hidden', 'true');
  };

  const target = (e) => {
    const cell = e.target && e.target.closest ? e.target.closest('.hm-cell') : null;
    return cell && cell.dataset.date ? cell : null;
  };

  grid.addEventListener('pointerover', (e) => { const c = target(e); if (c) show(c); });
  grid.addEventListener('pointermove', (e) => { const c = target(e); if (c) place(c); else hide(); });
  grid.addEventListener('pointerdown', (e) => { const c = target(e); if (c) show(c); });
  grid.addEventListener('pointerleave', hide);
  window.addEventListener('scroll', hide, { passive: true });
}

function buildSeries(range) {
  const days = state.days;
  const n = RANGE_DAYS[range] || RANGE_DAYS[DEFAULT_RANGE];
  const window = days.slice(-n);
  if (!window.length) return { labels: [], values: [], titles: [] };

  if (range === '30D') {
    return {
      labels: window.map((d) => shortDate(d.date)),
      values: window.map((d) => d.count),
      titles: window.map((d) => longDate(d.date)),
    };
  }

  if (range === '90D') {
    const buckets = [];
    for (let end = window.length; end > 0; end -= 7) {
      buckets.unshift(window.slice(Math.max(0, end - 7), end));
    }
    return {
      labels: buckets.map((b) => shortDate(b[0].date)),
      values: buckets.map((b) => b.reduce((a, d) => a + d.count, 0)),
      titles: buckets.map((b) => `${shortDate(b[0].date)} – ${shortDate(b[b.length - 1].date)}`),
    };
  }

  const months = new Map();
  for (const d of window) {
    const key = d.date.slice(0, 7);
    months.set(key, (months.get(key) || 0) + d.count);
  }
  const keys = [...months.keys()].sort();
  return {
    labels: keys.map((k) => {
      const parts = k.split('-');
      return `${MONTHS[Number(parts[1]) - 1] || parts[1]} ${parts[0].slice(2)}`;
    }),
    values: keys.map((k) => months.get(k)),
    titles: keys.map((k) => {
      const parts = k.split('-');
      return `${MONTHS[Number(parts[1]) - 1] || parts[1]} ${parts[0]}`;
    }),
  };
}

function areaGradient(ctx) {
  const chart = ctx.chart;
  const area = chart.chartArea;
  if (!area) return 'rgba(108, 99, 255, 0.22)';
  const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
  g.addColorStop(0, 'rgba(159, 122, 234, 0.42)');
  g.addColorStop(0.55, 'rgba(108, 99, 255, 0.18)');
  g.addColorStop(1, 'rgba(108, 99, 255, 0.01)');
  return g;
}

function tooltipTheme() {
  return {
    backgroundColor: 'rgba(16, 17, 27, 0.94)',
    borderColor: 'rgba(108, 99, 255, 0.55)',
    borderWidth: 1,
    titleColor: TEXT,
    bodyColor: TEXT,
    padding: 10,
    cornerRadius: 10,
    displayColors: false,
  };
}

function initTimelineChart() {
  const canvas = $('timelineChart');
  if (!canvas) return;
  if (!hasChart()) { updateRangeTile(); return; }

  const series = buildSeries(state.range);
  const ctx = canvas.getContext('2d');
  state.charts.timeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [{
        label: 'Contributions',
        data: series.values,
        borderColor: ACCENT,
        backgroundColor: areaGradient,
        fill: true,
        tension: 0.38,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: ACCENT_2,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion() ? false : { duration: 700, easing: 'easeOutQuart' },
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: Object.assign(tooltipTheme(), {
          callbacks: {
            title: (items) => series.titles[items[0]?.dataIndex] ?? items[0]?.label ?? '',
            label: (c) => ` ${format(c.parsed.y)} contribution${c.parsed.y === 1 ? '' : 's'}`,
          },
        }),
      },
      scales: {
        x: {
          ticks: { color: DIM, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
          grid: { display: false },
        },
        y: {
          ticks: { color: DIM, font: { size: 10 }, maxTicksLimit: 5 },
          grid: { color: 'rgba(255,255,255,0.05)' },
          beginAtZero: true,
        },
      },
    },
  });
  state.charts.timeline.$titles = series.titles;
  state.renderedRange = state.range;
  const cb = state.charts.timeline.options.plugins.tooltip.callbacks;
  cb.title = (items) => {
    const titles = state.charts.timeline.$titles || [];
    return titles[items[0]?.dataIndex] ?? items[0]?.label ?? '';
  };
  updateRangeTile();
}

function applyRange(range) {
  if (!RANGE_DAYS[range]) return;
  state.range = range;
  const control = $('range-control');
  if (control) {
    control.querySelectorAll('.seg-btn').forEach((b) => {
      const on = b.dataset.range === range;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  const chart = state.charts.timeline;
  if (chart && state.renderedRange !== range) {
    const series = buildSeries(range);
    chart.$titles = series.titles;
    chart.data.labels = series.labels;
    chart.data.datasets[0].data = series.values;
    chart.update();
  }
  state.renderedRange = range;
  updateRangeTile();
}

function setupRangeControl() {
  const control = $('range-control');
  if (!control) return;
  control.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('.seg-btn') : null;
    if (btn && btn.dataset.range) applyRange(btn.dataset.range);
  });
  applyRange(state.range);
}

function renderRhythmChart(days) {
  const canvas = $('rhythmChart');
  if (!canvas) return;
  const totals = new Array(7).fill(0);
  for (const d of days) {
    const date = parseDay(d.date);
    if (!date) continue;
    totals[(date.getUTCDay() + 6) % 7] += d.count;
  }
  const max = Math.max(...totals, 0);
  const maxIdx = totals.indexOf(max);
  if (max > 0) setText('rhythm-note', `peaks on ${WEEKDAYS[maxIdx]}`);

  if (!hasChart()) return;
  const ramp = ['#4a42b8', '#564dc9', '#6058d9', '#6C63FF', '#8273f0', '#9F7AEA', '#b08ef2'];
  const colors = totals.map((_, i) => (i === maxIdx && max > 0 ? ACCENT_2 : ramp[i % ramp.length]));

  state.charts.rhythm = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: WEEKDAYS,
      datasets: [{
        label: 'Contributions',
        data: totals,
        backgroundColor: colors,
        hoverBackgroundColor: colors.map((c, i) => (i === maxIdx ? '#b79af5' : ACCENT_2)),
        borderColor: totals.map((_, i) => (i === maxIdx && max > 0 ? '#d6c2ff' : 'transparent')),
        borderWidth: totals.map((_, i) => (i === maxIdx && max > 0 ? 1.5 : 0)),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 46,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion() ? false : { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: Object.assign(tooltipTheme(), {
          callbacks: {
            label: (c) => {
              const share = totals.reduce((a, b) => a + b, 0);
              const pct = share ? ((c.parsed.y / share) * 100).toFixed(1) : '0.0';
              return ` ${format(c.parsed.y)} contributions · ${pct}%`;
            },
          },
        }),
      },
      scales: {
        x: { ticks: { color: DIM, font: { size: 10 } }, grid: { display: false } },
        y: {
          ticks: { color: DIM, font: { size: 10 }, maxTicksLimit: 5 },
          grid: { color: 'rgba(255,255,255,0.05)' },
          beginAtZero: true,
        },
      },
    },
  });
}

const LANG_PALETTE = ['#6C63FF', '#9F7AEA', '#4f46e5', '#c4b5fd', '#22d3ee', '#7c5cf0', '#818cf8', '#2dd4bf'];

function renderLanguages(langs) {
  const list = $('lang-list');
  const top = (Array.isArray(langs) ? langs : [])
    .filter((l) => l && l.name)
    .map((l) => ({ name: l.name, size: Number(l.size) || 0 }))
    .slice(0, 6);
  const total = top.reduce((a, l) => a + l.size, 0) || 1;
  const colors = top.map((_, i) => LANG_PALETTE[i % LANG_PALETTE.length]);
  const canvas = $('langChart');

  if (canvas && hasChart() && top.length) {
    const centerText = {
      id: 'centerText',
      afterDatasetsDraw(chart) {
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data.length) return;
        const { x, y } = meta.data[0];
        const pct = ((top[0].size / total) * 100).toFixed(0);
        const ctx = chart.ctx;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#eef0f6';
        ctx.font = '700 26px "JetBrains Mono", monospace';
        ctx.fillText(pct + '%', x, y - 9);
        ctx.fillStyle = DIM;
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillText(top[0].name, x, y + 15);
        ctx.restore();
      },
    };

    state.charts.lang = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: top.map((l) => l.name),
        datasets: [{
          data: top.map((l) => l.size),
          backgroundColor: colors,
          borderColor: 'rgba(26, 27, 39, 0.9)',
          borderWidth: 2,
          borderRadius: 6,
          spacing: 3,
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        layout: { padding: 6 },
        animation: reduceMotion() ? false : { duration: 800 },
        plugins: {
          legend: { display: false },
          tooltip: Object.assign(tooltipTheme(), {
            callbacks: { label: (c) => ` ${c.label}: ${((c.parsed / total) * 100).toFixed(1)}%` },
          }),
        },
      },
      plugins: [centerText],
    });
  }

  if (!list) return;
  list.innerHTML = '';
  top.forEach((l, i) => {
    const pct = ((l.size / total) * 100).toFixed(1);
    const c = colors[i];
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="lang-row">
        <span class="lang-dot" style="background:${c}"></span>
        <span class="lang-name">${escapeHtml(l.name)}</span>
        <span class="lang-pct">${pct}%</span>
      </div>
      <div class="lang-bar"><span style="background:${c}"></span></div>`;
    list.appendChild(li);
    requestAnimationFrame(() =>
      setTimeout(() => {
        const bar = li.querySelector('.lang-bar > span');
        if (bar) bar.style.width = pct + '%';
      }, 120 + i * 90));
  });
}

function repoCard(r) {
  const a = document.createElement('a');
  a.className = 'repo';
  a.href = r.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.dataset.idx = String(r.idx);
  const langDot = r.language
    ? `<span class="repo-lang"><span class="lang-dot" style="background:${escapeHtml(r.languageColor || '#858585')}"></span>${escapeHtml(r.language)}</span>`
    : '';
  const rel = r.pushedAt ? relativeTime(r.pushedAt) : null;
  const updated = rel ? `<span class="repo-updated">${svgIcon('clock')}updated ${escapeHtml(rel)}</span>` : '';
  a.innerHTML = `
    <div class="repo-name">${escapeHtml(r.name)}</div>
    <div class="repo-desc">${escapeHtml(r.description || 'No description')}</div>
    <div class="repo-foot">${langDot}<span>★ ${format(r.stars)}</span><span>⑂ ${format(r.forks)}</span></div>
    ${updated}`;
  return a;
}

function renderRepos(repos) {
  const grid = $('repo-grid');
  if (!grid) return;
  grid.innerHTML = '';
  state.repoEls = [];
  if (!repos.length) {
    grid.innerHTML = '<p class="muted">No public repositories to show.</p>';
    return;
  }
  repos.forEach((r) => {
    const el = repoCard(r);
    state.repoEls[r.idx] = el;
    grid.appendChild(el);
  });
}

function sortedRepos(sort) {
  const list = state.repos.slice();
  if (sort === 'name') list.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  else if (sort === 'forks') list.sort((a, b) => b.forks - a.forks || b.stars - a.stars);
  else list.sort((a, b) => b.stars - a.stars || b.forks - a.forks);
  return list;
}

// FLIP: measure → reorder → invert → play.
function applySort(sort) {
  state.sort = sort;
  const control = $('sort-control');
  if (control) {
    control.querySelectorAll('.seg-btn').forEach((b) => {
      const on = b.dataset.sort === sort;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  const grid = $('repo-grid');
  if (!grid || !state.repoEls.length) return;

  const cards = Array.from(grid.children).filter((c) => c.classList.contains('repo'));
  if (!cards.length) return;
  const animate = !reduceMotion();
  const before = new Map();
  if (animate) cards.forEach((c) => before.set(c, c.getBoundingClientRect()));

  sortedRepos(sort).forEach((r) => {
    const el = state.repoEls[r.idx];
    if (el) grid.appendChild(el);
  });

  if (!animate) return;
  cards.forEach((c) => {
    const a = before.get(c);
    const b = c.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if (!dx && !dy) return;
    c.style.transition = 'none';
    c.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  requestAnimationFrame(() => {
    cards.forEach((c) => {
      c.style.transition = 'transform 430ms cubic-bezier(.2,.8,.2,1)';
      c.style.transform = 'translate(0, 0)';
      const clear = () => {
        c.style.transition = '';
        c.style.transform = '';
        c.removeEventListener('transitionend', clear);
      };
      c.addEventListener('transitionend', clear);
    });
  });
}

function setupSortControl() {
  const control = $('sort-control');
  if (!control) return;
  control.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('.seg-btn') : null;
    if (btn && btn.dataset.sort) applySort(btn.dataset.sort);
  });
  applySort(state.sort);
}

function setupCopy(s) {
  const btn = $('copy-embed');
  if (!btn) return;
  const embed = `<div align="center">
  <img height="200" alt="${s.name || s.login || 'GitHub'}'s GitHub stats" src="https://ankitporwal04.github.io/github-stats-dashboard/assets/stats.svg" />
  <img height="200" alt="Most used languages" src="https://ankitporwal04.github.io/github-stats-dashboard/assets/top-langs.svg" />
</div>`;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(embed);
      toast('Embed markdown copied ✓');
    } catch {
      toast('Copy failed — select manually');
    }
  });
}

function toast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 250);
  }, 1900);
}

function countUp(nodes) {
  const list = nodes instanceof Array ? nodes : Array.from(nodes || []);
  list.forEach((node) => {
    if (!node) return;
    const target = Number(node.dataset.target) || 0;
    const suffix = node.dataset.suffix || '';
    if (reduceMotion()) {
      node.textContent = format(target) + suffix;
      return;
    }
    const dur = 900;
    const start = performance.now();
    const token = (Number(node.dataset.token) || 0) + 1;
    node.dataset.token = String(token);
    const step = (now) => {
      if (Number(node.dataset.token) !== token) return; // superseded by a newer run
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
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}

load();
