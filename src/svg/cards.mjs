// SVG card generators — zero dependencies, pure string templates.
// Theme defaults match the user's original github-readme-stats setup:
//   title #6c63ff, icon #6c63ff, text #808080, transparent background.

export const THEME = {
  title: '#6c63ff',
  icon: '#6c63ff',
  text: '#808080',
  bg: 'transparent',
  border: 'transparent',
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const fmt = (n) => {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return String(n);
};

// ---------------------------------------------------------------------------
// Stats summary card (stars / commits / PRs / issues / followers / contribs)
// ---------------------------------------------------------------------------
export function statsCard(stats, theme = THEME) {
  const rows = [
    { icon: star, label: 'Total Stars Earned', value: fmt(stats.totalStars) },
    { icon: commit, label: `Total Commits (${stats.commitsYearLabel})`, value: fmt(stats.totalCommits) },
    { icon: pr, label: 'Total PRs', value: fmt(stats.totalPRs) },
    { icon: issue, label: 'Total Issues', value: fmt(stats.totalIssues) },
    { icon: people, label: 'Followers', value: fmt(stats.followers) },
  ];

  const startY = 55;
  const gap = 25;
  const lines = rows
    .map((r, i) => {
      const y = startY + i * gap;
      const delay = 450 + i * 150;
      return `
    <g class="stagger" style="animation-delay:${delay}ms" transform="translate(25, ${y})">
      <g transform="translate(0, -9)">${r.icon(theme.icon)}</g>
      <text class="stat" x="26" y="0">${esc(r.label)}:</text>
      <text class="stat value" x="220" y="0">${esc(r.value)}</text>
    </g>`;
    })
    .join('');

  const height = startY + rows.length * gap + 10;
  const width = 320;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GitHub statistics for ${esc(stats.login)}">
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.title}; }
    .stat { font: 400 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${theme.text}; }
    .value { font-weight: 600; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; } }
    .stagger { opacity: 0; animation: slideIn 0.45s ease-in-out forwards; }
    .fade { opacity: 0; animation: fadeIn 0.6s ease-in-out forwards; }
  </style>
  <rect x="0.5" y="0.5" rx="6" width="${width - 1}" height="${height - 1}" fill="${theme.bg}" stroke="${theme.border}"/>
  <text x="25" y="30" class="header fade">${esc(stats.name || stats.login)}'s GitHub Stats</text>
  ${lines}
</svg>`;
}

export const LANG_PALETTE = ['#8b7bff', '#22d3ee', '#f6c945', '#4f9dff', '#fb7185', '#34d399', '#f59e0b', '#a78bfa'];

export function topLangsCard(langs, theme = THEME, max = 6) {
  const items = langs.slice(0, max);
  const total = items.reduce((s, l) => s + l.size, 0) || 1;
  const color = (i) => LANG_PALETTE[i % LANG_PALETTE.length];

  const width = 620;
  const cx = 310, cy = 190, r = 92, sw = 30;
  const circumference = 2 * Math.PI * r;
  const gap = 3;

  // Donut built from stacked stroked circles: each arc is a dash of length
  // `frac*circumference`, offset by the running total, all rotated -90deg so
  // the first slice starts at the top and slices run clockwise.
  let acc = 0;
  const arcs = items
    .map((l, i) => {
      const len = (l.size / total) * circumference;
      const draw = Math.max(len - gap, 1);
      const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color(i)}" stroke-width="${sw}"
      stroke-dasharray="${draw.toFixed(2)} ${(circumference - draw).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}"
      class="seg" style="animation-delay:${250 + i * 120}ms" />`;
      acc += len;
      return seg;
    })
    .join('');

  // Marker labels around the ring: each label sits at its slice's mid-angle,
  // just outside the donut, with a colored dot linking it to the slice.
  const labelR = r + sw / 2 + 18;
  let cum = 0;
  const markers = items
    .map((l, i) => {
      const frac = l.size / total;
      const angle = ((-90 + (cum + frac / 2) * 360) * Math.PI) / 180;
      cum += frac;
      const lx = cx + labelR * Math.cos(angle);
      const ly = cy + labelR * Math.sin(angle);
      const right = Math.cos(angle) >= -0.05;
      const anchor = right ? 'start' : 'end';
      const tx = lx + (right ? 11 : -11);
      const pct = (frac * 100).toFixed(1);
      return `
    <g class="stagger" style="animation-delay:${500 + i * 110}ms">
      <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="5.5" fill="${color(i)}"/>
      <text x="${tx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" class="lang">${esc(l.name)} <tspan class="pct">${pct}%</tspan></text>
    </g>`;
    })
    .join('');

  const height = 380;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Most used languages">
  <style>
    .header { font: 600 19px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${theme.title}; }
    .lang { font: 400 13px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${theme.text}; }
    .pct { font-weight: 600; fill: #b9c0cc; }
    .seg { opacity: 0; animation: fadeIn 0.7s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; } }
    .stagger { opacity: 0; animation: slideIn 0.45s ease-in-out forwards; }
    .fade { opacity: 0; animation: fadeIn 0.8s ease-in-out forwards; }
  </style>
  <rect x="0.5" y="0.5" rx="6" width="${width - 1}" height="${height - 1}" fill="${theme.bg}" stroke="${theme.border}"/>
  <text x="25" y="38" class="header fade">Most Used Languages</text>
  <g transform="rotate(-90 ${cx} ${cy})">${arcs}</g>
  ${markers}
</svg>`;
}

// ---------------------------------------------------------------------------
// Minimal inline icons (octicon-style paths)
// ---------------------------------------------------------------------------
function icon(path, fill) {
  return `<svg viewBox="0 0 16 16" width="16" height="16" fill="${fill}"><path d="${path}"/></svg>`;
}
const star = (c) => icon('M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z', c);
const commit = (c) => icon('M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z', c);
const pr = (c) => icon('M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z', c);
const issue = (c) => icon('M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z', c);
const people = (c) => icon('M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Z', c);
