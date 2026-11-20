// Generates a synthetic circuit board for the hero animation: src/proto/pcbData.js
// Nothing here comes from a real design. It places plausible parts (an MCU module, ICs,
// passives, connectors), then routes octilinear traces between them on three layers.
// Run: node scripts/generate-board.mjs [seed]
import { writeFileSync } from 'node:fs'

const W = 98
const H = 52
const seed = Number(process.argv[2] ?? 2026)

let s = seed >>> 0
const rand = () => {
  s += 0x6d2b79f5
  let t = s
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const between = (a, b) => a + rand() * (b - a)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const r2 = (v) => Math.round(v * 100) / 100

// ---------- parts ----------
const parts = []
const overlaps = (p) =>
  parts.some((q) => Math.abs(p.x - q.x) < (p.w + q.w) / 2 + 1.2 && Math.abs(p.y - q.y) < (p.h + q.h) / 2 + 1.2)
const place = (p) => {
  if (p.x - p.w / 2 < 1.5 || p.x + p.w / 2 > W - 1.5 || p.y - p.h / 2 < 1.5 || p.y + p.h / 2 > H - 1.5) return false
  if (overlaps(p)) return false
  parts.push(p)
  return true
}

const mcu = { x: 84, y: 17, w: 13, h: 16, top: 1, kind: 'mcu' }
place(mcu)
// ICs
const icSpots = [
  [58, 14, 5, 5], [46, 34, 6, 4], [64, 38, 4, 4], [30, 16, 5, 6], [18, 36, 4, 4], [72, 44, 5, 3],
]
icSpots.forEach(([x, y, w, h]) => place({ x, y, w, h, top: 1, kind: 'ic' }))
// connectors along the edges
place({ x: 5, y: 26, w: 4, h: 14, top: 1, kind: 'conn' })
place({ x: 40, y: 48, w: 16, h: 3.5, top: 1, kind: 'conn' })
place({ x: 93, y: 42, w: 3.5, h: 10, top: 1, kind: 'conn' })
// passives clustered around ICs, plus a scatter
const ics = parts.filter((p) => p.kind === 'ic' || p.kind === 'mcu')
for (let i = 0; i < 400 && parts.length < 120; i += 1) {
  const anchor = rand() < 0.8 ? pick(ics) : { x: between(8, W - 8), y: between(6, H - 6), w: 0, h: 0 }
  const horiz = rand() < 0.5
  const big = rand() < 0.15
  const w = big ? 3.2 : 1.6
  const h = big ? 1.6 : 0.8
  place({
    x: anchor.x + between(-anchor.w / 2 - 6, anchor.w / 2 + 6),
    y: anchor.y + between(-anchor.h / 2 - 6, anchor.h / 2 + 6),
    w: horiz ? w : h,
    h: horiz ? h : w,
    top: rand() < 0.82 ? 1 : 0,
    kind: 'passive',
  })
}

// ---------- routing ----------
// Octilinear route a -> b: straight along the major axis, one 45-degree run, straight again.
const route = (a, b) => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const ax = Math.abs(dx)
  const ay = Math.abs(dy)
  const diag = Math.min(ax, ay)
  const sx = Math.sign(dx)
  const sy = Math.sign(dy)
  const lead = (Math.max(ax, ay) - diag) * between(0.2, 0.8)
  const p1 = ax > ay ? [a[0] + sx * lead, a[1]] : [a[0], a[1] + sy * lead]
  const p2 = [p1[0] + sx * diag, p1[1] + sy * diag]
  return [a, p1, p2, b].map(([x, y]) => [r2(x), r2(y)])
}
const pinOf = (p) => {
  // a point on the part's edge, snapped to a 0.5 mm pitch
  const side = Math.floor(rand() * 4)
  const t = Math.round(between(-0.4, 0.4) * (side % 2 ? p.h : p.w) * 2) / 2
  if (side === 0) return [p.x + t, p.y - p.h / 2]
  if (side === 1) return [p.x + p.w / 2, p.y + t]
  if (side === 2) return [p.x + t, p.y + p.h / 2]
  return [p.x - p.w / 2, p.y + t]
}

const layers = { 'F.Cu': [], 'B.Cu': [], 'In2.Cu': [] }
const vias = []
const addTrack = (layer, pts) => layers[layer].push(pts)

// 1. A parallel bus from the MCU to the left connector (the "designed" look).
const conn = parts.find((p) => p.kind === 'conn')
for (let i = 0; i < 8; i += 1) {
  const y0 = mcu.y - 5 + i * 0.9
  const y1 = conn.y - 4 + i * 0.9
  const xTurn = 62 - i * 0.9
  addTrack(i % 3 === 2 ? 'B.Cu' : 'F.Cu', [
    [r2(mcu.x - mcu.w / 2), r2(y0)],
    [r2(xTurn), r2(y0)],
    [r2(xTurn - Math.abs(y1 - y0)), r2(y1)],
    [r2(conn.x + conn.w / 2), r2(y1)],
  ])
}
// 2. Every IC and most passives get one to three nets toward the MCU or a neighbour.
parts.forEach((p) => {
  if (p === mcu || p === conn) return
  const nets = p.kind === 'ic' ? 3 : p.kind === 'conn' ? 4 : rand() < 0.85 ? 1 : 2
  for (let n = 0; n < nets; n += 1) {
    const toMcu = p.kind !== 'passive' || rand() < 0.35
    const target = toMcu
      ? mcu
      : parts.reduce((best, q) => (q !== p && Math.hypot(q.x - p.x, q.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y) ? q : best), mcu)
    const a = pinOf(p)
    const b = pinOf(target)
    const pts = route(a, b)
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    let layer = 'F.Cu'
    if (len > 30 && rand() < 0.35) layer = 'In2.Cu'
    else if (rand() < 0.38) layer = 'B.Cu'
    addTrack(layer, pts)
    if (layer !== 'F.Cu') {
      vias.push(pts[0], pts[pts.length - 1])
    }
  }
})
// 3. Stitching vias along the board edge.
for (let x = 3; x < W - 2; x += 4) vias.push([x, 1.6], [x, H - 1.6])
for (let y = 6; y < H - 4; y += 4) vias.push([1.6, y])

// ---------- output, ordered outward from the MCU ----------
const cx = mcu.x
const cy = mcu.y
const dist = (pts) => {
  const m = pts[Math.floor(pts.length / 2)]
  return Math.hypot(m[0] - cx, m[1] - cy)
}
const traces = {}
Object.entries(layers).forEach(([layer, tracks]) => {
  traces[layer] = tracks
    .sort((a, b) => dist(a) - dist(b))
    .map((pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(''))
    .join('')
})
const maxd = Math.hypot(W, H)
const viaOut = vias
  .map(([x, y]) => [r2(x), r2(y), r2(Math.hypot(x - cx, y - cy) / maxd)])
  .sort((a, b) => a[2] - b[2])
const partsOut = parts.map((p) => [r2(p.x), r2(p.y), p.top, r2(p.w), r2(p.h)])

const data = { synthetic: true, seed, w: W, h: H, mcu: [cx, cy], traces, vias: viaOut, parts: partsOut }
writeFileSync(
  new URL('../src/proto/pcbData.js', import.meta.url),
  `// Generated by scripts/generate-board.mjs (seed ${seed}). Synthetic: not a real design.\nexport const pcb = ${JSON.stringify(data)}\n`,
)
console.log({
  seed,
  parts: parts.length,
  tracks: Object.fromEntries(Object.entries(layers).map(([k, v]) => [k, v.length])),
  vias: viaOut.length,
})
