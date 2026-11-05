"""Generate the SVG cover art for projects that have no screenshot."""
import math, random, sys, os

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
W, H = 1200, 750
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"


def svg(body, bg):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<rect width="{W}" height="{H}" fill="{bg}"/>{body}</svg>\n')


def grid(color, step=50, opacity=0.5):
    lines = [f'<path d="' + " ".join(f"M{x} 0V{H}" for x in range(step, W, step)) + " " +
             " ".join(f"M0 {y}H{W}" for y in range(step, H, step)) +
             f'" stroke="{color}" stroke-width="1" opacity="{opacity}"/>']
    return "".join(lines)


def path(pts):
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)


def write(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)


# ---------------------------------------------------------------- chalkql
def chalkql():
    bg = "#1f2b26"
    chalk = "#e8efe9"
    dim = "#93a59b"
    add = "#9ef0b8"
    lines = [
        ("", "/* the SQL you mean */", dim),
        ("", "SELECT c.region, SUM(o.notional)", chalk),
        ("", "FROM   orders o", chalk),
        ("", "JOIN   clients c ON c.id = o.client_id", chalk),
        ("+", "WHERE  o.tenant_id = :principal.tenant", add),
        ("+", "  AND  c.desk IN (SELECT desk FROM grants", add),
        ("+", "                  WHERE user = :principal)", add),
        ("", "GROUP  BY c.region", chalk),
    ]
    body = ['<g opacity="0.06" fill="#fff">']
    rnd = random.Random(7)
    for _ in range(140):  # chalk dust
        body.append(f'<circle cx="{rnd.uniform(0, W):.0f}" cy="{rnd.uniform(0, H):.0f}" r="{rnd.uniform(1, 5):.1f}"/>')
    body.append("</g>")
    body.append(f'<rect x="70" y="110" width="1060" height="540" rx="18" fill="none" stroke="{dim}" stroke-opacity="0.35" stroke-width="2"/>')
    y = 200
    for mark, text, color in lines:
        if mark:
            body.append(f'<rect x="90" y="{y - 38}" width="1020" height="54" rx="8" fill="{add}" fill-opacity="0.10"/>')
            body.append(f'<text x="108" y="{y}" font-family="{MONO}" font-size="34" fill="{add}">+</text>')
        body.append(f'<text x="150" y="{y}" font-family="{MONO}" font-size="34" fill="{color}" xml:space="preserve">{text}</text>')
        y += 60
    # a padlock
    body.append(f'<g transform="translate(1010 60)" fill="none" stroke="{add}" stroke-width="6" stroke-linecap="round">'
                f'<path d="M20 50V32a30 30 0 0 1 60 0v18"/><rect x="6" y="50" width="88" height="70" rx="12" fill="{bg}"/>'
                f'<path d="M50 78v18"/></g>')
    write("chalkql.svg", svg("".join(body), bg))


# ---------------------------------------------------------------- mip-chart
def mip_chart():
    bg = "#0d1420"
    acc = "#38bdf8"
    rnd = random.Random(3)
    n = 4000
    vals, v = [], 0.0
    for i in range(n):
        v += rnd.gauss(0, 1.6) + 0.12 * math.sin(i / 300) + (2.2 * rnd.gauss(0, 1) if rnd.random() < 0.01 else 0)
        vals.append(v)
    lo, hi = min(vals), max(vals)

    def y_of(val, top, height):
        return top + height - (val - lo) / (hi - lo) * height

    body = [grid("#1b2636")]
    # main chart: min/max band per bucket + decimated line
    top, height, left, right = 80, 420, 60, 1140
    buckets = 180
    per = n // buckets
    upper, lower, mid = [], [], []
    for b in range(buckets):
        chunk = vals[b * per:(b + 1) * per]
        x = left + (right - left) * b / (buckets - 1)
        upper.append((x, y_of(max(chunk), top, height)))
        lower.append((x, y_of(min(chunk), top, height)))
        mid.append((x, y_of(sum(chunk) / len(chunk), top, height)))
    band = path(upper) + " L" + " L".join(f"{x:.1f} {y:.1f}" for x, y in reversed(lower)) + " Z"
    body.append(f'<path d="{band}" fill="{acc}" fill-opacity="0.18"/>')
    body.append(f'<path d="{path(mid)}" fill="none" stroke="{acc}" stroke-width="3" stroke-linejoin="round"/>')
    # level-of-detail tiers (the "mip pyramid") under the chart
    tiers = [(16, 560), (48, 610), (140, 660)]
    for i, (k, ty) in enumerate(tiers):
        per_k = n // k
        for b in range(k):
            x0 = left + (right - left) * b / k
            wdt = (right - left) / k - 3
            chunk = vals[b * per_k:(b + 1) * per_k]
            shade = 0.25 + 0.55 * (sum(chunk) / len(chunk) - lo) / (hi - lo)
            body.append(f'<rect x="{x0:.1f}" y="{ty}" width="{wdt:.1f}" height="34" rx="3" fill="{acc}" fill-opacity="{shade:.2f}"/>')
    # viewport bracket
    vx0, vx1 = 520, 820
    body.append(f'<rect x="{vx0}" y="550" width="{vx1 - vx0}" height="154" rx="6" fill="none" stroke="#f8fafc" stroke-width="3" stroke-dasharray="10 8"/>')
    body.append(f'<rect x="{vx0}" y="{top}" width="{vx1 - vx0}" height="{height}" fill="#f8fafc" fill-opacity="0.05"/>')
    write("mip-chart.svg", svg("".join(body), bg))


# ---------------------------------------------------------------- tsfm-forecasting
def tsfm():
    bg = "#120f1f"
    up, down, acc = "#34d399", "#f87171", "#a78bfa"
    rnd = random.Random(11)
    body = [grid("#211c36")]
    price, candles = 100.0, []
    for i in range(46):
        o = price
        c = o + rnd.gauss(0.25, 2.2)
        h = max(o, c) + abs(rnd.gauss(0, 1.3))
        l = min(o, c) - abs(rnd.gauss(0, 1.3))
        candles.append((o, h, l, c))
        price = c
    allv = [v for cd in candles for v in cd]
    lo, hi = min(allv) - 18, max(allv) + 18

    def y(v):
        return 90 + (hi - v) / (hi - lo) * 560

    x0, step = 60, 16
    for i, (o, h, l, c) in enumerate(candles):
        x = x0 + i * step
        col = up if c >= o else down
        body.append(f'<path d="M{x + 5} {y(h):.1f}V{y(l):.1f}" stroke="{col}" stroke-width="2"/>')
        top_, bot = y(max(o, c)), y(min(o, c))
        body.append(f'<rect x="{x}" y="{top_:.1f}" width="10" height="{max(bot - top_, 2):.1f}" fill="{col}"/>')
    now_x = x0 + len(candles) * step
    body.append(f'<path d="M{now_x} 70V680" stroke="#e9e5ff" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="6 8"/>')
    # forecast fan: quantile bands widening with horizon
    steps = 30
    end_x = 1150
    last = candles[-1][3]
    drift = 0.35
    for q, op in ((2.0, 0.14), (1.3, 0.2), (0.6, 0.3)):
        upper, lower = [], []
        for k in range(steps + 1):
            x = now_x + (end_x - now_x) * k / steps
            m = last + drift * k
            s = q * 2.4 * math.sqrt(k)
            upper.append((x, y(m + s)))
            lower.append((x, y(m - s)))
        d = path(upper) + " L" + " L".join(f"{x:.1f} {yy:.1f}" for x, yy in reversed(lower)) + " Z"
        body.append(f'<path d="{d}" fill="{acc}" fill-opacity="{op}"/>')
    med = [(now_x + (end_x - now_x) * k / steps, y(last + drift * k)) for k in range(steps + 1)]
    body.append(f'<path d="{path(med)}" fill="none" stroke="{acc}" stroke-width="3"/>')
    # a few sampled rollouts
    for r in range(5):
        v, pts = last, []
        for k in range(steps + 1):
            pts.append((now_x + (end_x - now_x) * k / steps, y(v)))
            v += drift + rnd.gauss(0, 2.3)
        body.append(f'<path d="{path(pts)}" fill="none" stroke="#e9e5ff" stroke-opacity="0.35" stroke-width="1.5"/>')
    write("tsfm-forecasting.svg", svg("".join(body), bg))


# ---------------------------------------------------------------- semifreddo
def semifreddo():
    bg = "#fbf4e8"
    old, new, shared, ink = "#9cc45a", "#ef6f93", "#e9dcc4", "#5b4636"
    # Two versions of a tree: root v1 (pistachio) and root v2 (strawberry),
    # v2 copies only the path to the changed leaf and shares every other subtree.
    nodes = {
        "r1": (420, 120), "r2": (780, 120),
        "a": (300, 300), "b1": (600, 300), "b2": (900, 300),
        "a1": (200, 480), "a2": (400, 480), "c": (520, 480), "d1": (680, 480), "d2": (980, 480),
    }
    leaves_y = 640
    edges_old = [("r1", "a"), ("r1", "b1"), ("b1", "c"), ("b1", "d1")]
    edges_new = [("r2", "a"), ("r2", "b2"), ("b2", "c"), ("b2", "d2")]
    edges_shared = [("a", "a1"), ("a", "a2")]
    body = []
    rnd = random.Random(5)
    for _ in range(60):  # sprinkles
        x, yy = rnd.uniform(0, W), rnd.uniform(0, H)
        a = rnd.uniform(0, 180)
        col = rnd.choice([old, new, "#f2b84b", "#7cc4e8"])
        body.append(f'<rect x="{x:.0f}" y="{yy:.0f}" width="16" height="5" rx="2.5" fill="{col}" opacity="0.35" transform="rotate({a:.0f} {x:.0f} {yy:.0f})"/>')

    def edge(a, b, col, w=6, dash=""):
        (x1, y1), (x2, y2) = nodes[a], nodes[b]
        d = f' stroke-dasharray="{dash}"' if dash else ""
        body.append(f'<path d="M{x1} {y1} C{x1} {(y1 + y2) / 2} {x2} {(y1 + y2) / 2} {x2} {y2}" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round"{d}/>')

    for a, b in edges_shared:
        edge(a, b, ink, 4)
    for a, b in edges_old:
        edge(a, b, old)
    for a, b in edges_new:
        edge(a, b, new)
    # leaves under each bottom node
    for key in ("a1", "a2", "c", "d1", "d2"):
        x, yy = nodes[key]
        for dx in (-40, 0, 40):
            body.append(f'<path d="M{x} {yy} L{x + dx} {leaves_y - 20}" stroke="{ink}" stroke-opacity="0.35" stroke-width="3"/>')
            col = old if key == "d1" else new if key == "d2" else shared
            body.append(f'<rect x="{x + dx - 16}" y="{leaves_y - 20}" width="32" height="32" rx="8" fill="{col}" stroke="{ink}" stroke-opacity="0.25" stroke-width="2"/>')

    def node(key, fill, label=""):
        x, yy = nodes[key]
        body.append(f'<circle cx="{x}" cy="{yy}" r="34" fill="{fill}" stroke="{ink}" stroke-opacity="0.35" stroke-width="3"/>')
        if label:
            body.append(f'<text x="{x}" y="{yy + 11}" text-anchor="middle" font-family="{MONO}" font-size="30" font-weight="700" fill="#fff">{label}</text>')

    for k in ("a", "a1", "a2", "c"):
        node(k, shared)
    for k in ("r1", "b1", "d1"):
        node(k, old)
    for k in ("r2", "b2", "d2"):
        node(k, new)
    for key, label in (("r1", "v1"), ("r2", "v2")):
        x, yy = nodes[key]
        body.append(f'<text x="{x}" y="{yy + 11}" text-anchor="middle" font-family="{MONO}" font-size="28" font-weight="700" fill="#fff">{label}</text>')
    write("semifreddo.svg", svg("".join(body), bg))


# ---------------------------------------------------------------- heartbeatscheduler
def heartbeat():
    bg = "#1a0f14"
    acc = "#fb7185"
    body = [grid("#2b1820")]
    # ECG trace with a beat every `period` px
    beat_xs = list(range(150, 1150, 200))
    pts = [(40, 150)]
    for bx in beat_xs:
        pts += [(bx - 40, 150), (bx - 25, 138), (bx - 12, 150), (bx - 4, 150), (bx, 70), (bx + 8, 196), (bx + 16, 150), (bx + 50, 150), (bx + 70, 132), (bx + 92, 150)]
    pts.append((1160, 150))
    body.append(f'<path d="{path(pts)}" fill="none" stroke="{acc}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>')
    for bx in beat_xs:
        body.append(f'<path d="M{bx} 220V700" stroke="{acc}" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="4 8"/>')
    # Four lanes: the loop starts on lane 0; at each beat a busy thread hands half its remaining work to an idle worker.
    lanes = 4
    lane_y = [270 + i * 105 for i in range(lanes)]
    left, right = 60, 1150
    shades = ["#fb7185", "#f59e0b", "#a78bfa", "#38bdf8"]
    # simpler, legible pattern: split work evenly after each beat
    segs = [
        (0, left, beat_xs[0], 0),
        (0, beat_xs[0], beat_xs[1], 0), (1, beat_xs[0] + 6, beat_xs[1], 1),
        (0, beat_xs[1], 860, 0), (1, beat_xs[1], 870, 1), (2, beat_xs[1] + 6, 850, 2), (3, beat_xs[1] + 6, 880, 3),
    ]
    for lane, x0, x1, c in segs:
        body.append(f'<rect x="{x0 + 3}" y="{lane_y[lane]}" width="{x1 - x0 - 6}" height="62" rx="10" fill="{shades[c]}" fill-opacity="0.85"/>')
    # split arrows
    for (src, dst, bx) in ((0, 1, beat_xs[0]), (0, 2, beat_xs[1]), (1, 3, beat_xs[1])):
        y1, y2 = lane_y[src] + 62, lane_y[dst]
        body.append(f'<path d="M{bx} {y1 + 4} C{bx + 30} {y1 + 30} {bx + 30} {y2 - 30} {bx + 8} {y2 - 4}" fill="none" stroke="#fde7ec" stroke-width="3" stroke-linecap="round"/>')
    # idle (empty) lane outlines
    for lane in range(lanes):
        body.append(f'<rect x="{left}" y="{lane_y[lane]}" width="{right - left}" height="62" rx="10" fill="none" stroke="#fde7ec" stroke-opacity="0.12" stroke-width="2"/>')
    write("heartbeatscheduler.svg", svg("".join(body), bg))


# ---------------------------------------------------------------- timerwheel
def timerwheel():
    bg = "#17130a"
    acc = "#fbbf24"
    cx, cy, r_out, r_in = 600, 375, 300, 110
    spokes = 32
    rnd = random.Random(2)
    occupied = {i for i in range(spokes) if rnd.random() < 0.38}
    body = [grid("#2a2312")]
    body.append(f'<circle cx="{cx}" cy="{cy}" r="{r_out + 30}" fill="none" stroke="{acc}" stroke-opacity="0.18" stroke-width="2"/>')
    for i in range(spokes):
        a0 = 2 * math.pi * i / spokes - math.pi / 2
        a1 = 2 * math.pi * (i + 1) / spokes - math.pi / 2
        gap = 0.012

        def p(r, a):
            return cx + r * math.cos(a), cy + r * math.sin(a)

        o0, o1 = p(r_out, a0 + gap), p(r_out, a1 - gap)
        i0, i1 = p(r_in, a1 - gap), p(r_in, a0 + gap)
        d = (f"M{o0[0]:.1f} {o0[1]:.1f} A{r_out} {r_out} 0 0 1 {o1[0]:.1f} {o1[1]:.1f} "
             f"L{i0[0]:.1f} {i0[1]:.1f} A{r_in} {r_in} 0 0 0 {i1[0]:.1f} {i1[1]:.1f} Z")
        filled = i in occupied
        body.append(f'<path d="{d}" fill="{acc}" fill-opacity="{0.16 if filled else 0.04}" stroke="{acc}" stroke-opacity="0.35" stroke-width="1.5"/>')
        # occupancy bitmap ring
        b0, b1 = p(r_out + 30, a0 + 0.03), p(r_out + 30, a1 - 0.03)
        body.append(f'<path d="M{b0[0]:.1f} {b0[1]:.1f} A{r_out + 30} {r_out + 30} 0 0 1 {b1[0]:.1f} {b1[1]:.1f}" stroke="{acc}" stroke-width="10" stroke-opacity="{0.95 if filled else 0.12}" fill="none"/>')
        if filled:  # timers linked into the spoke
            am = (a0 + a1) / 2
            for k in range(rnd.randint(1, 3)):
                tr = r_in + 45 + k * 62
                x, y = p(tr, am)
                body.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="12" fill="{acc}"/>')
    # hand (current tick)
    ah = 2 * math.pi * 9.5 / spokes - math.pi / 2
    hx, hy = cx + (r_out + 50) * math.cos(ah), cy + (r_out + 50) * math.sin(ah)
    body.append(f'<path d="M{cx} {cy} L{hx:.1f} {hy:.1f}" stroke="#fff7e0" stroke-width="5" stroke-linecap="round"/>')
    body.append(f'<circle cx="{cx}" cy="{cy}" r="{r_in - 20}" fill="{bg}" stroke="{acc}" stroke-opacity="0.5" stroke-width="2"/>')
    body.append(f'<text x="{cx}" y="{cy + 14}" text-anchor="middle" font-family="{MONO}" font-size="38" fill="{acc}">O(1)</text>')
    write("timerwheel.svg", svg("".join(body), bg))


for fn in (chalkql, mip_chart, tsfm, semifreddo, heartbeat, timerwheel):
    fn()
print("ok")
