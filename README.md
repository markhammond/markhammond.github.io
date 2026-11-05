# markhammond.github.io

A showcase of my public GitHub projects, served by GitHub Pages. Layout inspired by
[EmbedCatalog](https://github.com/embedcatalog/embedcatalog).

Plain static HTML, CSS and JS; no build step.

| Path | What |
|---|---|
| `index.html` | the page |
| `data/projects.js` | the projects, in the curated order shown on the page |
| `assets/app.js` | filtering, search, sort, detail dialog; applies `data/live.json` when present |
| `scripts/build-live.mjs` | writes `data/live.json` (stars, last push, NuGet/npm versions) at deploy time |
| `.github/workflows/pages.yml` | builds the snapshot and deploys, on every push to `main` and daily |
| `assets/styles.css` | light and dark themes |
| `assets/covers/` | generated cover art for projects without a screenshot (`python3 scripts/make_covers.py assets/covers`) |
| `assets/img/` | screenshots from the project repos, resized to 1200px WebP with their colour profiles kept (`cwebp -metadata icc`), so Display P3 and HDR screenshots render correctly. The BlazorRealtime cover is an AVIF with an HDR gain map (SDR everywhere, brighter on HDR displays), made by `scripts/crop-hdr-screenshot.swift` and `avifgainmaputil` |
| `assets/fonts/` | self-hosted Inter and JetBrains Mono |

## No third-party calls from the browser

Stars, last push dates and package versions are fetched once per deploy by the workflow, using its own
`GITHUB_TOKEN`, and served from the site as `data/live.json`. Visitors' browsers only ever talk to
`markhammond.github.io`: no GitHub API rate limit to share behind a corporate proxy, nothing for a proxy to
block, and no fonts or avatars from other hosts. If the snapshot is missing, the values in `data/projects.js`
are shown instead.

## Publishing

In the repo's Settings → Pages, set **Source** to **GitHub Actions**. The workflow then deploys on every push,
and once a day so the numbers stay fresh.

## Linking to a filtered view

Filters are kept in the address, so any filtered view can be shared:

- `?tag=entitlements`: projects tagged entitlements
- `?tag=sql,entitlements&kind=library`: libraries with both tags
- `?lang=TypeScript`, `?kind=sample`, `?q=stream`

Lists are comma-separated and case-insensitive; values that match nothing are ignored. A project's
detail view can be added too, e.g. `?tag=entitlements#/p/chalkql`.

## Adding a project

Add an entry to `data/projects.js`. A sample of another project takes `parent` (that project's `id`) and `path`
(its folder in the parent's repo), and is listed under that project's samples.

## Running locally

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/build-live.mjs   # optional: the live numbers
python3 -m http.server 8765
```

Then open http://localhost:8765.
