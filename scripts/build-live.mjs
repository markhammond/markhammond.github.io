// Deploy-time snapshot of the numbers that change: GitHub stars and last push,
// and the latest NuGet / npm package versions. Writes data/live.json, which the
// page reads from its own origin, so visitors' browsers never call a third-party API.
//
//   GITHUB_TOKEN=... node scripts/build-live.mjs
//
// Every lookup is best effort: whatever fails is left out, and the page falls
// back to the values in data/projects.js. The script never fails the build.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const sandbox = { window: {} };
vm.runInNewContext(await readFile(`${root}data/projects.js`, "utf8"), sandbox);
const { owner, projects } = sandbox.window.SHOWCASE;

const token = process.env.GITHUB_TOKEN;
const ghHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "showcase-build",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const live = { generated: new Date().toISOString(), repos: {}, packages: {} };
const libraries = projects.filter((p) => !p.parent);

const jobs = [
  ...libraries.map(async (p) => {
    const r = await getJson(`https://api.github.com/repos/${owner}/${p.repo}`, ghHeaders);
    live.repos[p.repo] = { stars: r.stargazers_count, pushed: r.pushed_at };
  }),
  ...libraries.filter((p) => p.package).map(async (p) => {
    const { registry, id } = p.package;
    let version;
    if (registry === "npm") {
      version = (await getJson(`https://registry.npmjs.org/${encodeURIComponent(id)}/latest`)).version;
    } else {
      const { versions = [] } = await getJson(`https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/index.json`);
      version = versions.filter((v) => !v.includes("-")).pop();
    }
    if (version) live.packages[`${registry}:${id}`] = version;
  }),
];

const results = await Promise.allSettled(jobs);
for (const r of results) if (r.status === "rejected") console.warn(`warning: ${r.reason.message ?? r.reason}`);

await writeFile(`${root}data/live.json`, JSON.stringify(live, null, 2) + "\n");
console.log(`data/live.json: ${Object.keys(live.repos).length} repos, ${Object.keys(live.packages).length} packages`);
