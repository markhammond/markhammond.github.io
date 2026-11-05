# markhammond.github.io

A showcase of my public GitHub projects, served by GitHub Pages. Layout inspired by
[EmbedCatalog](https://github.com/embedcatalog/embedcatalog).

Plain static HTML, CSS and JS; no build step.

| Path | What |
|---|---|
| `index.html` | the page |
| `data/projects.js` | the projects, in the curated order shown on the page |
| `assets/app.js` | filtering, search, sort, detail dialog; refreshes stars, last push and package versions live from GitHub, NuGet and npm |
| `assets/styles.css` | light and dark themes |
| `assets/covers/` | generated cover art for projects without a screenshot (`python3 scripts/make_covers.py assets/covers`) |
| `assets/img/` | screenshots from the project repos, resized to 1200px WebP |

## Adding a project

Add an entry to `data/projects.js`. A sample of another project takes `parent` (that project's `id`) and `path`
(its folder in the parent's repo), and is listed under that project's samples.

## Running locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.
