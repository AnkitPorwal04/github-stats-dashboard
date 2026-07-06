// Fetches GitHub stats via the GraphQL API, aggregates them, and writes:
//   docs/data/stats.json     -> consumed by the static dashboard
//   docs/assets/stats.svg    -> embeddable summary card
//   docs/assets/top-langs.svg-> embeddable top-languages card
//
// Zero runtime dependencies (Node >=18 native fetch).
//
// Env:
//   GH_TOKEN  (required) classic PAT with `repo` + `read:user` scope
//             (or fine-grained token with read access to your repos + profile)
//   GH_USER   (required) the GitHub login to report on, e.g. AnkitPorwal04

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { statsCard, topLangsCard, THEME } from '../src/svg/cards.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TOKEN = process.env.GH_TOKEN;
const USER = process.env.GH_USER;

const EXCLUDE_LANGS = new Set(
  (process.env.GH_EXCLUDE_LANGS ?? 'Jupyter Notebook')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

if (!TOKEN) {
  console.error('ERROR: GH_TOKEN env var is required (classic PAT with repo + read:user).');
  process.exit(1);
}
if (!USER) {
  console.error('ERROR: GH_USER env var is required (your GitHub login).');
  process.exit(1);
}

const GQL = 'https://api.github.com/graphql';

async function gql(query, variables) {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'github-stats-dashboard',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

// Main profile + repositories query.
const PROFILE_QUERY = `
query($login: String!, $after: String) {
  user(login: $login) {
    name
    login
    avatarUrl
    bio
    createdAt
    followers { totalCount }
    following { totalCount }
    pullRequests { totalCount }
    issues { totalCount }
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        description
        url
        stargazerCount
        forkCount
        isPrivate
        primaryLanguage { name color }
        languages(first: 15, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

// Per-year contributions (commits) for all-time totals.
const YEAR_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      restrictedContributionsCount
    }
  }
}`;

// Current-year calendar for the contribution timeline chart.
const CALENDAR_QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount }
        }
      }
    }
  }
}`;

async function fetchProfile() {
  let nodes = [];
  let after = null;
  let user = null;
  do {
    const data = await gql(PROFILE_QUERY, { login: USER, after });
    user = data.user;
    if (!user) throw new Error(`User "${USER}" not found.`);
    nodes = nodes.concat(user.repositories.nodes);
    after = user.repositories.pageInfo.hasNextPage ? user.repositories.pageInfo.endCursor : null;
  } while (after);
  user.repositories.nodes = nodes;
  return user;
}

async function fetchAllTimeCommits(createdAt) {
  const startYear = new Date(createdAt).getUTCFullYear();
  const nowYear = new Date().getUTCFullYear();
  let total = 0;
  for (let y = startYear; y <= nowYear; y++) {
    const from = `${y}-01-01T00:00:00Z`;
    const to = `${y}-12-31T23:59:59Z`;
    const data = await gql(YEAR_QUERY, { login: USER, from, to });
    const c = data.user.contributionsCollection;
    total += c.totalCommitContributions + c.restrictedContributionsCount;
  }
  return { total, startYear, nowYear };
}

function aggregateLanguages(repos) {
  const map = new Map();
  for (const repo of repos) {
    for (const edge of repo.languages?.edges || []) {
      const name = edge.node.name;
      if (EXCLUDE_LANGS.has(name.toLowerCase())) continue;
      const prev = map.get(name) || { name, color: edge.node.color, size: 0 };
      prev.size += edge.size;
      map.set(name, prev);
    }
  }
  return [...map.values()].sort((a, b) => b.size - a.size);
}

function buildTimeline(weeks) {
  // Flatten daily contributions; also produce a monthly rollup for the chart.
  const days = [];
  for (const w of weeks) for (const d of w.contributionDays) days.push(d);
  const monthly = {};
  for (const d of days) {
    const key = d.date.slice(0, 7); // YYYY-MM
    monthly[key] = (monthly[key] || 0) + d.contributionCount;
  }
  return {
    days,
    monthly: Object.entries(monthly).map(([month, count]) => ({ month, count })),
  };
}

async function main() {
  console.log(`Fetching stats for ${USER} ...`);
  const user = await fetchProfile();

  const repos = user.repositories.nodes;
  const totalStars = repos.reduce((s, r) => s + r.stargazerCount, 0);
  const totalForks = repos.reduce((s, r) => s + r.forkCount, 0);

  const languages = aggregateLanguages(repos);
  const commits = await fetchAllTimeCommits(user.createdAt);
  const cal = await gql(CALENDAR_QUERY, { login: USER });
  const calendar = cal.user.contributionsCollection.contributionCalendar;
  const timeline = buildTimeline(calendar.weeks);

  const topRepos = repos
    .filter((r) => !r.isPrivate)
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount,
      forks: r.forkCount,
      language: r.primaryLanguage?.name || null,
      languageColor: r.primaryLanguage?.color || null,
    }));

  const stats = {
    generatedAt: new Date().toISOString(),
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: (user.bio || '').replace(/^[-\s]+/, '').trim() || null,
    createdAt: user.createdAt,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    totalStars,
    totalForks,
    totalRepos: user.repositories.totalCount,
    totalPRs: user.pullRequests.totalCount,
    totalIssues: user.issues.totalCount,
    totalCommits: commits.total,
    commitsYearLabel: commits.startYear === commits.nowYear ? `${commits.nowYear}` : `${commits.startYear}\u2013${commits.nowYear}`,
    contributionsThisYear: calendar.totalContributions,
    languages: languages.map((l) => ({ name: l.name, color: l.color, size: l.size })),
    timeline,
    topRepos,
  };

  // Write dashboard data.
  const dataPath = join(ROOT, 'docs/data/stats.json');
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify(stats, null, 2));
  console.log(`Wrote ${dataPath}`);

  // Write SVG cards.
  const assetsDir = join(ROOT, 'docs/assets');
  await mkdir(assetsDir, { recursive: true });
  await writeFile(join(assetsDir, 'stats.svg'), statsCard(stats, THEME));
  await writeFile(join(assetsDir, 'top-langs.svg'), topLangsCard(stats.languages, THEME));
  console.log(`Wrote ${assetsDir}/stats.svg and top-langs.svg`);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
