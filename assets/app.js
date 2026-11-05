(() => {
  "use strict";

  const data = window.SHOWCASE;
  const OWNER = data.owner;
  // Star counts are hidden for now; set to true to show them on cards and in detail views.
  const SHOW_STARS = false;
  const LANG_COLORS = { "C#": "#178600", TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5", Rust: "#dea584" };
  const byId = Object.fromEntries(data.projects.map((p) => [p.id, p]));

  // Samples inherit language/licence/package from their parent library.
  for (const p of data.projects) {
    p.kind = p.parent ? "sample" : "library";
    p.screenshot ??= !!p.parent;
    if (p.parent) {
      const parent = byId[p.parent];
      p.language ??= parent.language;
      p.license ??= parent.license;
    }
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const repoUrl = (p) => `https://github.com/${OWNER}/${p.repo}` + (p.path ? `/tree/HEAD/${p.path}` : "");
  const pkgUrl = (pkg) => (pkg.registry === "npm" ? `https://www.npmjs.com/package/${pkg.id}` : `https://www.nuget.org/packages/${pkg.id}`);
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
  const starsOf = (p) => (p.parent ? byId[p.parent].stars : p.stars) || 0;
  const updatedOf = (p) => (p.parent ? byId[p.parent].updated : p.updated);

  const ICON = {
    star: '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>',
    pkg: '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="m8.878.392 5.25 3.045c.54.314.872.89.872 1.514v6.098a1.75 1.75 0 0 1-.872 1.514l-5.25 3.045a1.75 1.75 0 0 1-1.756 0l-5.25-3.045A1.75 1.75 0 0 1 1 11.049V4.951c0-.624.332-1.201.872-1.514L7.122.392a1.75 1.75 0 0 1 1.756 0ZM7.875 1.69l-4.63 2.685L8 7.133l4.755-2.758-4.63-2.685a.248.248 0 0 0-.25 0ZM2.5 5.677v5.372c0 .09.047.171.125.216l4.625 2.683V8.432Zm6.25 8.271 4.625-2.683a.25.25 0 0 0 .125-.216V5.677L8.75 8.432Z"/></svg>',
    github: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  // ------------------------------------------------------------------ state
  const state = { q: "", kinds: new Set(), langs: new Set(), tags: new Set(), tagQuery: "", sort: "curated" };

  // Filters live in the query string, so a filtered view can be linked to, e.g.
  //   ?tag=entitlements   ?tag=sql,entitlements&kind=library   ?lang=TypeScript   ?q=stream
  // Lists are comma-separated (repeating the parameter works too) and matched without
  // regard to case; values that match nothing are ignored. `sort` is read too.
  const URL_LISTS = { kind: "kinds", lang: "langs", tag: "tags" };
  const known = (fn) => new Map(data.projects.flatMap((p) => [].concat(fn(p) ?? [])).map((v) => [v.toLowerCase(), v]));
  const KNOWN = { kinds: known((p) => p.kind), langs: known((p) => p.language), tags: known((p) => p.tags) };

  function readUrl() {
    const params = new URLSearchParams(location.search);
    for (const [param, key] of Object.entries(URL_LISTS)) {
      const values = params.getAll(param).flatMap((v) => v.split(",")).map((v) => KNOWN[key].get(v.trim().toLowerCase()));
      state[key] = new Set(values.filter(Boolean));
    }
    state.q = params.get("q") || "";
    const sort = params.get("sort");
    state.sort = sort && sort in SORTS ? sort : "curated";
  }

  function writeUrl() {
    const parts = [];
    for (const [param, key] of Object.entries(URL_LISTS)) {
      if (state[key].size) parts.push(`${param}=${[...state[key]].map(encodeURIComponent).join(",")}`);
    }
    if (state.q.trim()) parts.push(`q=${encodeURIComponent(state.q.trim())}`);
    if (state.sort !== "curated") parts.push(`sort=${encodeURIComponent(state.sort)}`);
    const search = parts.length ? `?${parts.join("&")}` : "";
    if (search !== location.search) history.replaceState(history.state, "", location.pathname + search + location.hash);
  }

  // ------------------------------------------------------------------ header bits
  $("#tagline").textContent = data.tagline;
  $("#year").textContent = new Date().getFullYear();

  function renderStats() {
    const libs = data.projects.filter((p) => p.kind === "library");
    const samples = data.projects.filter((p) => p.kind === "sample");
    const stars = libs.reduce((n, p) => n + (p.stars || 0), 0);
    const langs = new Set(libs.map((p) => p.language));
    const items = [
      [libs.length, libs.length === 1 ? "library" : "libraries"],
      [samples.length, "Tapline samples"],
      [libs.filter((p) => p.package).length, "published packages"],
      [langs.size, langs.size === 1 ? "language" : "languages"],
      [stars, stars === 1 ? "star" : "stars"],
    ];
    $("#stats").innerHTML = items.map(([n, l]) => `<div><dt>${esc(l)}</dt><dd>${n}</dd></div>`).join("");
  }

  // ------------------------------------------------------------------ filters
  function countBy(fn) {
    const m = new Map();
    for (const p of data.projects) for (const k of [].concat(fn(p))) m.set(k, (m.get(k) || 0) + 1);
    return m;
  }

  function renderLangFilters() {
    const counts = countBy((p) => p.language);
    $("#lang-filters").innerHTML = [...counts]
      .sort((a, b) => b[1] - a[1])
      .map(([l, n]) => `<label><input type="checkbox" name="lang" value="${esc(l)}"${state.langs.has(l) ? " checked" : ""}>
        <span class="lang-dot" style="background:${LANG_COLORS[l] || "var(--faint)"}"></span>${esc(l)}<span class="count">${n}</span></label>`)
      .join("");
  }

  function renderTagFilters() {
    const counts = countBy((p) => p.tags || []);
    const q = state.tagQuery.trim().toLowerCase();
    let tags = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (q) tags = tags.filter(([t]) => t.includes(q));
    else tags = tags.filter(([t]) => state.tags.has(t)).concat(tags.filter(([t]) => !state.tags.has(t))).slice(0, 14);
    $("#tag-filters").innerHTML =
      tags.map(([t, n]) => `<label><input type="checkbox" name="tag" value="${esc(t)}"${state.tags.has(t) ? " checked" : ""}>${esc(t)}<span class="count">${n}</span></label>`).join("") ||
      `<p class="kicker">No tags match.</p>`;
  }

  $("#filters").addEventListener("change", (e) => {
    const el = e.target;
    if (el.type !== "checkbox") return;
    const set = { kind: state.kinds, lang: state.langs, tag: state.tags }[el.name];
    el.checked ? set.add(el.value) : set.delete(el.value);
    render();
  });
  $("#tag-search").addEventListener("input", (e) => { state.tagQuery = e.target.value; renderTagFilters(); });
  $("#search").addEventListener("input", (e) => { state.q = e.target.value; render(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  function clearFilters() {
    state.kinds.clear(); state.langs.clear(); state.tags.clear(); state.q = ""; state.tagQuery = "";
    $("#search").value = ""; $("#tag-search").value = "";
    for (const cb of document.querySelectorAll("#filters input[type=checkbox]")) cb.checked = false;
    render();
  }
  $("#clear-filters").addEventListener("click", clearFilters);
  // The results line offers Clear too: on phones the filter panel starts collapsed.
  $("#result-count").addEventListener("click", (e) => { if (e.target.closest("[data-clear]")) clearFilters(); });
  $("#filters-btn").addEventListener("click", () => {
    const open = $("#filters").classList.toggle("open");
    $("#filters-btn").setAttribute("aria-expanded", String(open));
  });

  function toggleTag(tag) {
    state.tags.has(tag) ? state.tags.delete(tag) : state.tags.add(tag);
    render();
  }

  // ------------------------------------------------------------------ list
  function matches(p) {
    if (state.kinds.size && !state.kinds.has(p.kind)) return false;
    if (state.langs.size && !state.langs.has(p.language)) return false;
    if (state.tags.size && ![...state.tags].every((t) => (p.tags || []).includes(t))) return false;
    const q = state.q.trim().toLowerCase();
    if (q) {
      // `path` lets the code's names (e.g. "LiveGrid", from samples/LiveGrid.Sample) find
      // samples whose titles are spaced out.
      const hay = [p.title, p.kicker, p.summary, p.repo, p.path, ...(p.tags || [])].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  const SORTS = {
    curated: () => 0,
    updated: (a, b) => String(updatedOf(b)).localeCompare(String(updatedOf(a))),
    stars: (a, b) => starsOf(b) - starsOf(a),
    name: (a, b) => a.title.localeCompare(b.title),
  };

  function card(p) {
    const lang = p.language
      ? `<span><span class="lang-dot" style="background:${LANG_COLORS[p.language] || "var(--faint)"}"></span>${esc(p.language)}</span>`
      : "";
    const pkg = p.package ? `<span title="${esc(p.package.id)} on ${p.package.registry === "npm" ? "npm" : "NuGet"}">${ICON.pkg}v${esc(p.package.version)}</span>` : "";
    const meta = p.parent
      ? `${lang}<span>Sample of&nbsp;<a class="parent-link" href="#/p/${esc(p.parent)}">${esc(byId[p.parent].title)}</a></span>`
      : `${lang}${pkg}<span title="Last push">${esc(fmtDate(p.updated))}</span>`;
    const stars = p.parent || !SHOW_STARS ? "" : `<span title="GitHub stars">${ICON.star}${starsOf(p)}</span>`;
    const tags = (p.tags || []).slice(0, 4)
      .map((t) => `<button type="button" class="tag" data-tag="${esc(t)}" aria-pressed="${state.tags.has(t)}">${esc(t)}</button>`).join("");
    const badges = p.parent ? `<div class="badges"><span class="badge badge-sample">Tapline sample</span></div>` : "";
    return `<article class="card" data-id="${esc(p.id)}">
      <div class="card-cover${p.screenshot ? " screenshot" : ""}"><img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async"></div>
      <div class="card-body">
        ${badges}
        <div class="card-head">
          <div>
            <h3><a href="#/p/${esc(p.id)}">${esc(p.title)}</a></h3>
            <p class="kicker">${esc(p.kicker)}</p>
          </div>
          <a class="visit" href="${esc(repoUrl(p))}" target="_blank" rel="noopener">Visit</a>
        </div>
        <p class="summary">${esc(p.summary)}</p>
        <div class="tags">${tags}</div>
        <div class="card-foot">
          <div class="meta">${meta}</div>
          <div class="meta">${stars}<a class="visit" style="border:0;padding:0;height:auto;background:none" href="${esc(repoUrl(p))}" target="_blank" rel="noopener" aria-label="${esc(p.title)} on GitHub">${ICON.github}</a></div>
        </div>
      </div>
    </article>`;
  }

  function render() {
    const visible = data.projects.filter(matches);
    const sorted = state.sort === "curated" ? visible : [...visible].sort(SORTS[state.sort]);
    const libs = sorted.filter((p) => p.kind === "library");
    const samples = sorted.filter((p) => p.kind === "sample");
    let html = libs.map(card).join("");
    if (samples.length) {
      html += `<h2 class="section-label" id="samples">Tapline samples <span>Runnable apps from the Tapline repo, each a project of its own</span></h2>`;
      html += samples.map(card).join("");
    }
    $("#grid").innerHTML = html;
    $("#empty").hidden = visible.length > 0;
    const total = data.projects.length;
    const active = state.kinds.size + state.langs.size + state.tags.size;
    const filtered = active > 0 || state.q.trim() !== "";
    $("#result-count").innerHTML = filtered
      ? `${visible.length} of ${total} projects · <button type="button" class="link-btn" data-clear>Clear filters</button>`
      : `${total} projects`;
    $("#clear-filters").hidden = !filtered;
    $("#filters-btn").textContent = active ? `Filters (${active})` : "Filters";
    renderTagFilters();
    for (const cb of document.querySelectorAll('#filters input[name="kind"]')) cb.checked = state.kinds.has(cb.value);
    for (const cb of document.querySelectorAll('#filters input[name="lang"]')) cb.checked = state.langs.has(cb.value);
    writeUrl();
  }

  $("#grid").addEventListener("click", (e) => {
    const tag = e.target.closest(".tag");
    if (tag) { e.preventDefault(); toggleTag(tag.dataset.tag); }
  });

  // ------------------------------------------------------------------ detail dialog
  const dialog = $("#detail");

  function detail(p) {
    const parent = p.parent && byId[p.parent];
    const cmd = p.run || p.install;
    const facts = [
      ["Language", p.language],
      ["Licence", p.license],
      p.requires && ["Requires", p.requires],
      p.package && ["Package", `<a href="${esc(pkgUrl(p.package))}" target="_blank" rel="noopener">${esc(p.package.id)}</a> v${esc(p.package.version)}`],
      SHOW_STARS && !p.parent && ["Stars", String(starsOf(p))],
      !p.parent && ["Last push", fmtDate(p.updated)],
      parent && ["Part of", `<a href="#/p/${esc(parent.id)}">${esc(parent.title)}</a>`],
    ].filter(Boolean);
    const samples = data.projects.filter((s) => s.parent === p.id);
    const extraLinks = (p.links || []).map((l) => `<a class="secondary" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("");
    const pkgLink = p.package ? `<a class="secondary" href="${esc(pkgUrl(p.package))}" target="_blank" rel="noopener">${p.package.registry === "npm" ? "npm" : "NuGet"}</a>` : "";
    return `
      <button class="icon-btn detail-close" type="button" data-close aria-label="Close">${ICON.close}</button>
      <div class="detail-hero"><div class="detail-cover${p.screenshot ? " screenshot" : ""}"><img src="${esc(p.cover)}" alt=""></div></div>
      <div class="detail-main">
        <div>
          <h2 id="detail-title">${esc(p.title)}</h2>
          <p class="kicker">${esc(p.kicker)}</p>
          <p>${esc(p.description || p.summary)}</p>
          ${p.highlights ? `<h3>Highlights</h3><ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
          ${cmd ? `<h3>${p.run ? "Run it (from a clone of the repo)" : "Install"}</h3>
            <div class="code"><code>${esc(cmd)}</code><button class="copy" type="button" data-copy="${esc(cmd)}">Copy</button></div>` : ""}
          ${samples.length ? `<h3>Samples</h3><div class="sample-strip">${samples.map((s) => `<a href="#/p/${esc(s.id)}"><img src="${esc(s.cover)}" alt="" loading="lazy">${esc(s.title)}</a>`).join("")}</div>` : ""}
          ${p.gallery ? `<h3>Gallery</h3><div class="gallery">${p.gallery.map((g) => `<a href="${esc(g)}" target="_blank" rel="noopener"><img src="${esc(g)}" alt="" loading="lazy"></a>`).join("")}</div>` : ""}
        </div>
        <aside class="detail-side">
          <a class="primary" href="${esc(repoUrl(p))}" target="_blank" rel="noopener">${ICON.github} ${p.parent ? "View sample" : "View on GitHub"}</a>
          ${pkgLink}${extraLinks}
          <dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${k === "Package" || k === "Part of" ? v : esc(v)}</dd></div>`).join("")}</dl>
          ${(p.tags || []).length ? `<div class="tags">${p.tags.map((t) => `<span class="tag" style="cursor:default">${esc(t)}</span>`).join("")}</div>` : ""}
        </aside>
      </div>`;
  }

  function openDetail(id) {
    const p = byId[id];
    if (!p) return closeDetail();
    $("#detail-body").innerHTML = detail(p);
    $("#detail-body").scrollTop = 0;
    dialog.scrollTop = 0;
    if (!dialog.open) dialog.showModal();
    document.title = `${p.title} · ${data.name}`;
  }

  function closeDetail() {
    if (dialog.open) dialog.close();
    document.title = `${data.name} · Projects`;
  }

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest("[data-close]")) { history.pushState("", "", location.pathname + location.search); closeDetail(); }
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).then(() => {
        copy.textContent = "Copied";
        setTimeout(() => (copy.textContent = "Copy"), 1400);
      });
    }
  });
  dialog.addEventListener("close", () => {
    if (location.hash.startsWith("#/p/")) history.pushState("", "", location.pathname + location.search);
    document.title = `${data.name} · Projects`;
  });

  function route() {
    const h = location.hash;
    if (h.startsWith("#/p/")) return openDetail(decodeURIComponent(h.slice(4)));
    closeDetail();
  }
  window.addEventListener("hashchange", route);

  // ------------------------------------------------------------------ theme
  $("#theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  // ------------------------------------------------------------------ live data
  // Stars, last-push dates and package versions come from data/live.json, a
  // snapshot written at deploy time by scripts/build-live.mjs. It is served from
  // this site, so no visitor's browser calls GitHub, NuGet or npm. If it is
  // missing (local preview, failed build) the values in data/projects.js stand.
  async function refresh() {
    let live;
    try {
      const r = await fetch("data/live.json", { cache: "no-cache" });
      if (!r.ok) return;
      live = await r.json();
    } catch (e) {
      return;
    }
    for (const p of data.projects) {
      if (p.kind !== "library") continue;
      const repo = live.repos?.[p.repo];
      if (repo) { p.stars = repo.stars; p.updated = repo.pushed; }
      const v = p.package && live.packages?.[`${p.package.registry}:${p.package.id}`];
      if (v) p.package.version = v;
    }
    renderStats();
    render();
    if (dialog.open && location.hash.startsWith("#/p/")) openDetail(decodeURIComponent(location.hash.slice(4)));
  }

  // ------------------------------------------------------------------ boot
  readUrl();
  $("#search").value = state.q;
  $("#sort").value = state.sort;
  renderStats();
  renderLangFilters();
  render();
  route();
  refresh();
})();
