// Showcase data. Order here is the "Curated" sort order on the page.
// `repo` is the GitHub repo name under OWNER; stars and dates are refreshed live
// from data/live.json (built at deploy time); the values here are only the fallback.
// `screenshot: true` shows a cover whole (letterboxed) instead of cropped to fill;
// samples default to true. In `highlights`, `backticks` mark type and API names (shown as code).
window.SHOWCASE = {
  owner: "markhammond",
  name: "Mark Hammond",
  tagline:
    "Building blocks for streaming real-time data, safe SQL, time-series viewing, forecasting, and low-latency .NET primitives.",
  projects: [
    {
      id: "chalkql",
      repo: "chalkql",
      title: "ChalkQL",
      kicker: "SQL, safely.",
      summary:
        "Zero-trust federated SQL query planning, optimisation and execution for .NET, powered by Apache Calcite.",
      description:
        "ChalkQL applies zero-trust principles to SQL, rewriting queries to enforce need-to-know access and tenant isolation across federated data sources. Write the SQL you mean and let ChalkQL enforce fine-grained authorisation: entitlement policy is embedded into the relational plan before optimisation, so it survives joins, subqueries, CTEs and aggregation.",
      highlights: [
        "Row, column, value-disclosure and aggregate-disclosure entitlements",
        "Tenant isolation, including transitive and multi-dimensional resource scopes",
        "Federation across ADO.NET, DuckDB, POCO collections and custom sources",
        "Standing views with experimental incremental maintenance (DBSP-style)",
        "Separate catalogues per sovereign zone, so no query crosses one by construction",
      ],
      cover: "assets/covers/chalkql.svg",
      language: "C#",
      license: "ELv2",
      tags: ["sql", "entitlements", "query-engine", "access-control", "apache-calcite", "dotnet", "data-platform", "chalkql"],
      package: { registry: "nuget", id: "ChalkQL", version: "0.6.1" },
      install: "dotnet add package ChalkQL",
      requires: ".NET 10 · JDK 21+ for the Calcite planner",
      links: [{ label: "Tutorial", href: "https://github.com/markhammond/chalkql/blob/HEAD/docs/tutorial.md" }],
      stars: 0,
      updated: "2026-10-30",
    },

    // ---- ChalkQL samples: shown as projects of their own, linked to the parent
    {
      id: "chalkql-blotter",
      parent: "chalkql",
      repo: "chalkql",
      path: "dotnet/samples/Chalk.Sample.Blotter",
      title: "Virtual Blotter",
      kicker: "An unobtrusive live grid.",
      summary:
        "A Blazor QuickGrid trade blotter over five million orders and their fills in PostgreSQL: scroll, sort and filter every row while the house keeps trading.",
      description:
        "The host keeps no copy of the corpus. ChalkQL pushes each tab's filter, sort, keyset seek and limit into PostgreSQL, reads the database and the rows the streams have just sent in one statement, and keeps every tab and filter in use current as an incrementally maintained standing view, all within a memory budget of a few megabytes.",
      cover: "assets/img/chalkql-virtual-blotter.webp",
      tags: ["data-grid", "postgresql", "standing-views", "blazor", "sql-editor", "chalkql"],
      run: "dotnet run -c Release --project dotnet/samples/Chalk.Sample.Blotter",
    },
    {
      id: "chalkql-quickstart",
      parent: "chalkql",
      repo: "chalkql",
      path: "dotnet/samples/Chalk.Sample.Quickstart",
      title: "Quickstart",
      kicker: "The guide's first program, runnable.",
      summary:
        "Twenty days of currency rates as an in-memory table, queried with positional, named and list parameters, and an ORDER BY that costs nothing.",
      description:
        "A list of records becomes a table with a declared order and unique key. The program starts its own planner sidecar, prepares and runs statements, and prints the plan for ORDER BY ts, which has no Sort because the host declared the order. It is the guide's quickstart verbatim, so the build runs what the documentation promises.",
      cover: "assets/covers/chalkql-quickstart.svg",
      screenshot: false,
      tags: ["getting-started", "parameters", "poco", "collation", "chalkql"],
      run: "dotnet run --project dotnet/samples/Chalk.Sample.Quickstart",
      links: [{ label: "Guide", href: "https://github.com/markhammond/chalkql/blob/HEAD/docs/guide.md#quickstart" }],
    },
    {
      id: "chalkql-tutorial",
      parent: "chalkql",
      repo: "chalkql",
      path: "dotnet/samples/Chalk.Sample.Tutorial",
      title: "Tutorial",
      kicker: "Nineteen chapters, every output real.",
      summary:
        "A marketplace of customers, suppliers, orders and rates in nineteen small programs, from a list as a table to entitlements, live pivots and incremental views.",
      description:
        "Each chapter prints what it does, the SQL it runs, the plan where the plan is the point, and the result. The written tutorial quotes this program's output, and a script checks every block against a fresh run, so no number in it goes stale. Pass a chapter's number to run it alone.",
      cover: "assets/covers/chalkql-tutorial.svg",
      screenshot: false,
      tags: ["tutorial", "entitlements", "federation", "incremental-views", "duckdb", "sqlite", "chalkql"],
      run: "dotnet run --project dotnet/samples/Chalk.Sample.Tutorial",
      links: [{ label: "Tutorial", href: "https://github.com/markhammond/chalkql/blob/HEAD/docs/tutorial.md" }],
    },
    {
      id: "chalkql-akade-indexedset",
      parent: "chalkql",
      repo: "chalkql",
      path: "dotnet/samples/Chalk.Sample.AkadeIndexedSet",
      title: "Akade.IndexedSet Source",
      kicker: "A third-party index library as a first-class source.",
      summary:
        "Akade.IndexedSet's hash and ordered indexes, used by ChalkQL's planner: an equality becomes an index lookup that scans 2 rows of 10,004.",
      description:
        "One IndexedSet becomes one source and one table, with its indexes found rather than registered by hand. The planner turns equality and range predicates into lookups, keeps a filter for what no index covers, and sees the host's own changes once the table is refreshed, transactional appends included.",
      cover: "assets/covers/chalkql-akade-indexedset.svg",
      screenshot: false,
      tags: ["custom-source", "indexes", "pushdown", "poco", "chalkql"],
      run: "dotnet run --project dotnet/samples/Chalk.Sample.AkadeIndexedSet",
    },
    {
      id: "tapline",
      repo: "tapline",
      title: "Tapline",
      kicker: "Real-time last-mile data distribution.",
      summary:
        "A transport-agnostic, zero-allocation real-time fan-out engine for .NET that shapes delivery around priority, freshness and backpressure.",
      description:
        "Tapline unifies shared state distribution and ordered messaging into a cohesive client layer. Frames are prioritised via weighted classes, conflated and ack-clocked; large payloads travel out-of-band; every subscription is bounded in memory and in how long it may go unacknowledged. It also teaches Blazor Server to stream — binary records go straight to a replica in the page over the circuit you already have.",
      highlights: [
        "Transactional watches across multiple sources — complete units of work or an explicit error",
        "BBR-inspired flow control: weighted priority lanes, conflation, ack-clocking",
        "Sandboxed, fuel-bounded WebAssembly transducers and folds on the hot path",
        "Zero allocations per frame in steady state",
        "Transports: Blazor Server circuits and MagicOnion (gRPC)",
      ],
      cover: "assets/img/tapline-blazor_realtime.avif",
      screenshot: true,
      language: "C#",
      license: "ELv2",
      tags: ["realtime", "streaming", "pubsub", "blazor", "backpressure", "dotnet", "tapline"],
      package: { registry: "nuget", id: "Tapline", version: "0.2.0" },
      install: "dotnet add package Tapline",
      requires: ".NET 10",
      links: [
        { label: "Architecture", href: "https://github.com/markhammond/tapline/blob/HEAD/docs/architecture.md" },
        { label: "Clients", href: "https://github.com/markhammond/tapline/blob/HEAD/docs/client.md" },
      ],
      stars: 0,
      updated: "2026-11-03",
    },

    // ---- Tapline samples: shown as projects of their own, linked to the parent
    {
      id: "tapline-blazor-realtime",
      parent: "tapline",
      repo: "tapline",
      path: "samples/BlazorRealtime.Sample",
      title: "Blazor Real-Time",
      kicker: "Animation synchronised to streaming music.",
      summary:
        "A field of ridge lines moving to music, 60 frames a second over one Blazor circuit — the music plays on even when the link is capped.",
      description:
        "The server plays a MIDI arrangement and computes a field of ridge lines that moves to it, encoded once for every viewer. Notes ride a high-priority lane and the browser plays them; the ridges fill what bandwidth is left, blended so the motion stays smooth however few frames get through.",
      cover: "assets/img/tapline-blazor-realtime-amber.avif",
      screenshot: false,
      tags: ["blazor", "realtime", "audio", "priority-lanes", "tapline"],
      run: "dotnet run -c Release --project samples/BlazorRealtime.Sample",
      license: "CC BY-NC-SA 4.0",
    },
    {
      id: "tapline-blazing-order-books",
      parent: "tapline",
      repo: "tapline",
      path: "samples/BlazingOrderBooks.Sample",
      title: "Blazing Order Books",
      kicker: "Streaming order books with delta-based conflation.",
      summary:
        "Binance's most traded perpetuals, live: each Blazor circuit gets only the levels that changed, conflated to what its link can carry.",
      description:
        "A feed handler builds the book from a venue's depth and trade feeds, a Tapline data provider offers it as topics, and the router streams each client the levels that changed since it last heard — fixed-width binary records, checksummed end to end. The sample's README follows a level change from venue to screen, with the cost of each step.",
      cover: "assets/img/tapline-blazing_order_books.webp",
      tags: ["order-book", "conflation", "blazor", "market-data", "tapline"],
      run: "dotnet run --project samples/BlazingOrderBooks.Sample",
    },
    {
      id: "tapline-pivot-table",
      parent: "tapline",
      repo: "tapline",
      path: "samples/PivotTable.Sample",
      title: "Pivot Table",
      kicker: "A live position viewer using idiomatic SQL.",
      summary:
        "A brokerage's risk and hedges by client, region, channel, instrument and venue — pivoted live, valued at the marks, with realised and unrealised PnL.",
      description:
        "Simulated clients trade linear perpetuals against the house, which nets risk and hedges the residual on external venues. Drag fields to reshape it: the page writes the SQL, ChalkQL keeps it current as a standing view, and Tapline streams the cells that change.",
      cover: "assets/img/tapline-live_positions.webp",
      tags: ["pivot", "sql", "chalkql", "blazor", "pnl", "tapline"],
      run: "dotnet run --project samples/PivotTable.Sample",
    },
    {
      id: "tapline-live-grid",
      parent: "tapline",
      repo: "tapline",
      path: "samples/LiveGrid.Sample",
      title: "Live Grid",
      kicker: "A streaming virtual blotter with alerts, bolted onto PostgreSQL.",
      summary:
        "A trade blotter over a million orders and their fills: scroll, sort and filter everything while the house keeps trading.",
      description:
        "The server maintains each reader's window; Tapline carries it to the browser as binary rows, only what changed, conflated to the reader's link; the page draws the rows itself. Warm, a grid's session allocates nothing on an answer's way to the wire, and each session works within a 64 MB budget.",
      cover: "assets/img/tapline-live_grid.webp",
      tags: ["data-grid", "postgresql", "chalkql", "blazor", "sql-editor", "tapline"],
      run: "dotnet run --project samples/LiveGrid.Sample",
    },
    {
      id: "tapline-activity-feed",
      parent: "tapline",
      repo: "tapline",
      path: "samples/ActivityFeed.Sample",
      title: "Activity Feed",
      kicker: "Privacy-preserving feeds.",
      summary:
        "A medical practice streams bookings, check-ins and calls to a room to everyone in it — each feed shaped by need-to-know access rules.",
      description:
        "Reception, each GP, the practice manager, each patient and carer, and each waiting-room screen sees the same activity from their own perspective. Each person's feed is theirs alone.",
      cover: "assets/img/tapline-activity_feeds.webp",
      tags: ["activity-feed", "privacy", "entitlements", "blazor", "access-control", "tapline"],
      run: "dotnet run --project samples/ActivityFeed.Sample",
    },
    {
      id: "tapline-secure-sign-in",
      parent: "tapline",
      repo: "tapline",
      path: "samples/SignIn.Sample",
      title: "Secure Sign-In",
      kicker: "Passkeys, and passwords the server never sees.",
      summary:
        "Sign in to a Tapline router from a Blazor page with a passkey or a password (OPAQUE, RFC 9807), and reach a service that serves only the signed in.",
      description:
        "Illustrative only: password sign-in uses opaque-ke through Tapline.Authentication.Opaque. Shows how authentication modules plug into the router and how providers can refuse anonymous connections.",
      cover: "assets/img/tapline-sign_in.webp",
      tags: ["security", "passkeys", "authentication", "blazor", "opaque", "tapline"],
      run: "dotnet run --project samples/SignIn.Sample",
    },

    {
      id: "mip-chart",
      repo: "mip-chart",
      title: "mip-chart",
      kicker: "Google Maps for time-series data.",
      summary:
        "Level-of-detail charting that streams and decimates to the viewport. Framework-agnostic, uPlot-based.",
      description:
        "Like map tiles, mip-chart only ever fetches and draws the points the current viewport can actually show. It keeps per-density tiers and serves the one that matches your zoom, so you can pan and zoom across years of high-frequency data and the chart stays smooth.",
      highlights: [
        "Virtual level of detail: per-density tiers, on-demand fetch and eviction",
        "Prioritised, conflated request lanes — the visible range always paints first",
        "Synced multi-pane charts with per-pane, log- and OHLC-aware Y-autofit",
        "Minimap scrubber and offline, self-contained HTML snapshot export",
        "Drops into React, Vue, Svelte, Blazor or no framework at all",
      ],
      cover: "assets/covers/mip-chart.svg",
      language: "TypeScript",
      license: "MIT",
      tags: ["charting", "time-series", "level-of-detail", "lttb", "uplot", "typescript"],
      package: { registry: "npm", id: "mip-chart", version: "0.3.0" },
      install: "npm install mip-chart",
      stars: 0,
      updated: "2026-06-22",
    },
    {
      id: "tsfm-forecasting",
      repo: "tsfm-forecasting",
      title: "Tsfm.Forecasting",
      kicker: "Time-series foundation models, native in .NET.",
      summary:
        "Native .NET inference for the Kronos K-line, TimesFM 3.0, t0 and Timestral foundation models, on CPU or GPU via TorchSharp.",
      description:
        "None of these models is a text LLM, so GGUF-based .NET runtimes cannot load them — the architectures had to be ported. Tsfm.Forecasting gives probabilistic forecasts from Kronos, TimesFM 3.0, t0 (alpha, beta) and Timestral (5M–209M) with a safetensors reader and weight packages where licences allow.",
      highlights: [
        "Kronos — batteries included, with Small and Mini weight packages",
        "TimesFM 3.0, t0-alpha / t0-beta and Timestral (Mistral AI)",
        "CPU, CUDA and Apple GPU (MPS) through TorchSharp",
        "Probabilistic outputs from Monte Carlo rollouts",
      ],
      cover: "assets/covers/tsfm-forecasting.svg",
      language: "C#",
      license: "MIT / Apache-2.0",
      tags: ["time-series-forecasting", "kronos", "timesfm3", "timestral", "ohlc", "dotnet"],
      package: { registry: "nuget", id: "Tsfm.Forecasting.Kronos", version: "0.2.0" },
      install: "dotnet add package Tsfm.Forecasting.Kronos",
      requires: ".NET 10 · TorchSharp backend",
      stars: 1,
      updated: "2026-10-30",
    },
    {
      id: "semifreddo",
      repo: "semifreddo",
      title: "Semifreddo",
      kicker: "Delectable semi-frozen collections.",
      summary:
        "Persistent data structures for .NET with structural sharing and predictable allocation as first-class design goals.",
      description:
        "Frozen collections are built once and then only read; Semifreddo collections are half-cold — never changed in place, yet every change returns a new version that shares almost all of its structure with the old one. A small set of collections, each built to be fast and to allocate predictably.",
      highlights: [
        "`ImmVector` and `ImmFlexVector` (RRB: fast concat, split, insert)",
        "`ImmMap`, `ImmSet` (HAMT) and insertion-ordered `ImmOrderedMap`",
        "`ImmDag` with incremental Pearce–Kelly topological sorting",
        "Deferred payload reclamation for DAGs (`RetiringDag`)",
        "Transients for batch edits, zero-allocation enumeration, AOT-friendly",
      ],
      cover: "assets/covers/semifreddo.svg",
      language: "C#",
      license: "MIT",
      tags: ["persistent-data-structure", "immutable", "hamt", "dag", "topological-sort", "dotnet"],
      package: { registry: "nuget", id: "Semifreddo", version: "0.1.0" },
      install: "dotnet add package Semifreddo",
      stars: 0,
      updated: "2026-11-04",
    },
    {
      id: "heartbeatscheduler",
      repo: "heartbeatscheduler",
      title: "HeartbeatScheduler",
      kicker: "Nanosecond task scheduling without the heart pangs.",
      summary:
        "Heartbeat scheduling for micro-task parallel loops in .NET, with zero allocation per loop.",
      description:
        "When the work takes nanoseconds, dispatch and wake-ups outweigh anything extra cores win back. A heartbeat loop runs sequentially and, at most once per heartbeat (5 µs by default), each thread splits off half its remaining work for an idle worker — so parallelism costs a bounded fraction of run time however short the iterations.",
      highlights: [
        "Loops shorter than a heartbeat stay plain loops on the calling thread",
        "Batched loops and cost estimates for iterations of a few nanoseconds",
        "Struct bodies are inlined — no interface call per iteration",
        "Host-owned worker threads (priority, affinity, QoS)",
      ],
      cover: "assets/covers/heartbeatscheduler.svg",
      language: "C#",
      license: "MIT",
      tags: ["parallel-processing", "task-scheduler", "micro-tasks", "zero-allocation", "dotnet"],
      package: { registry: "nuget", id: "HeartbeatScheduler", version: "0.1.0" },
      install: "dotnet add package HeartbeatScheduler",
      stars: 0,
      updated: "2026-11-04",
    },
    {
      id: "timerwheel",
      repo: "timerwheel",
      title: "TimerWheel",
      kicker: "A caller-driven hashed timing wheel.",
      summary:
        "Zero-allocation hashed timing wheel for .NET. No background threads, no internal scheduling and no clock ownership.",
      description:
        "Designed for single-threaded event loops, simulations and deterministic testing where the host controls time and execution. TimerWheel manages deadlines and expiry without imposing a threading model, so it embeds into existing runtimes rather than competing with them.",
      highlights: [
        "O(1) scheduling and cancellation on a reusable slab",
        "Generation-safe handles — stale IDs can't cancel reused slots",
        "Occupancy bitmap makes large time jumps cheap",
        "Bounded, lossless, deadline-ordered delivery per poll",
      ],
      cover: "assets/covers/timerwheel.svg",
      language: "C#",
      license: "MIT",
      tags: ["timer-wheel", "hashed-wheel-timer", "event-loop", "zero-allocation", "dotnet"],
      package: { registry: "nuget", id: "TimerWheel", version: "0.1.0" },
      install: "dotnet add package TimerWheel",
      stars: 0,
      updated: "2026-11-03",
    },
  ],
};
