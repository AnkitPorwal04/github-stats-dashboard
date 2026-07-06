# github-stats-dashboard

Self-hosted GitHub statistics — a **static dashboard** (GitHub Pages) plus **embeddable SVG cards** for your profile README. No external service, no rate limits, zero runtime dependencies.

A scheduled GitHub Action fetches your stats from the GitHub GraphQL API, writes `docs/data/stats.json` and two SVG cards into the repo, and commits them. The dashboard reads the committed JSON in the browser — so **no token is ever exposed client-side**.

- **Live dashboard:** `https://ankitporwal04.github.io/github-stats-dashboard/`
- **Stats card:** `docs/assets/stats.svg`
- **Languages card:** `docs/assets/top-langs.svg`

---

## How it works

```
scripts/fetch-stats.mjs   GraphQL → docs/data/stats.json + docs/assets/*.svg
src/svg/cards.mjs         SVG card templates (theme #6c63ff)
docs/                     static dashboard served by GitHub Pages
.github/workflows/        scheduled regenerate-and-commit (every 12h)
```

The dashboard and the embeddable cards share the same generated data, so they never disagree.

---

## Setup (already deployed — this is for reference / re-running)

### 1. Regenerate locally

```bash
GH_TOKEN="$(gh auth token)" GH_USER=AnkitPorwal04 npm run build
```

`GH_TOKEN` needs read access to your profile and repos. Your `gh` CLI token already has it.

### 2. Automatic updates

`.github/workflows/update-stats.yml` runs every 12 hours (and on manual dispatch). By default it uses the built-in `GITHUB_TOKEN`, which can read **public** contributions.

To include **private** contribution counts (your original setup used `count_private=true`), add a Personal Access Token:

1. Create a token at **Settings → Developer settings → Personal access tokens**
   - Fine-grained: read access to your repositories + account profile, **or**
   - Classic: `repo` + `read:user` scopes.
2. Add it to this repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `STATS_TOKEN`
   - Value: your token
3. The workflow automatically prefers `STATS_TOKEN` when present (`secrets.STATS_TOKEN || secrets.GITHUB_TOKEN`).

Without `STATS_TOKEN`, scheduled runs show public-only numbers, which may be lower than the initial snapshot.

### 3. GitHub Pages

Pages serves from the `main` branch, `/docs` folder. Enable at **Settings → Pages** if it isn't already.

---

## Configuration

Environment variables read by `scripts/fetch-stats.mjs`:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `GH_TOKEN` | yes | — | Token for the GraphQL API |
| `GH_USER` | yes | — | GitHub login to report on |
| `GH_EXCLUDE_LANGS` | no | `Jupyter Notebook` | Comma-separated languages to omit (notebook byte-size skews charts) |

Card colors live in `src/svg/cards.mjs` (`THEME`): title/icon `#6c63ff`, text `#808080`, transparent background — matching the original profile styling.

---

## Embedding in your profile README

```markdown
<div align="center">
  <img height="200" alt="Ankit Porwal's GitHub stats"
       src="https://ankitporwal04.github.io/github-stats-dashboard/assets/stats.svg" />
  <img height="200" alt="Top languages"
       src="https://ankitporwal04.github.io/github-stats-dashboard/assets/top-langs.svg" />
</div>

<p align="center">
  <a href="https://ankitporwal04.github.io/github-stats-dashboard/"><b>Full dashboard →</b></a>
</p>
```

Use the **GitHub Pages** URL (`*.github.io/.../assets/*.svg`), not `raw.githubusercontent.com`. Raw serves SVG as `text/plain`, which browsers refuse to render in an `<img>`; Pages serves the correct `image/svg+xml`. The Pages copy refreshes each time the workflow commits.
