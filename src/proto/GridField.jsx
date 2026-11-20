import { useEffect, useRef } from 'react'
import { finePointer, reducedMotion } from './motion'

const CYAN = [79, 227, 240]
const MAGENTA = [255, 42, 109]
const AMBER = [255, 179, 71]
const VIOLET = [156, 140, 255]
const PACKET_COLORS = [CYAN, CYAN, MAGENTA, AMBER, VIOLET]

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round)

const MAJOR = 4 // a brighter grid line every 4 cells
const PARALLAX = 0.12 // the lattice drifts at 12% of scroll speed, so it reads as a layer far behind the content
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

// Background for the lower half of the page: a faint lattice that wakes up around the cursor
// (dots brighten, bend away and shift toward magenta), ripples on click, and carries a few
// signal packets routed along the grid like traces on a board. Touch screens get a slow
// wandering light instead of the cursor. Reduced motion: a still lattice, nothing moves.
export default function GridField() {
  const wrap = useRef(null)
  const canvas = useRef(null)

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const still = reducedMotion()
    const fine = finePointer()

    const base = document.createElement('canvas')
    const bctx = base.getContext('2d')
    let W = 0
    let H = 0
    let dpr = 1
    let gap = 34

    // Static lattice, drawn once per resize with one spare major period so it can scroll.
    const drawBase = () => {
      const h = H + gap * MAJOR
      base.width = Math.ceil(W * dpr)
      base.height = Math.ceil(h * dpr)
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bctx.clearRect(0, 0, W, h)
      bctx.fillStyle = rgba(CYAN, 0.035)
      for (let x = 0; x <= W; x += gap * MAJOR) bctx.fillRect(Math.round(x), 0, 1, h)
      for (let y = 0; y <= h; y += gap * MAJOR) bctx.fillRect(0, Math.round(y), W, 1)
      for (let gy = 0; gy * gap <= h; gy += 1) {
        for (let gx = 0; gx * gap <= W; gx += 1) {
          const major = gx % MAJOR === 0 && gy % MAJOR === 0
          bctx.fillStyle = rgba(CYAN, major ? 0.22 : 0.09)
          const s = major ? 3 : 2
          bctx.fillRect(gx * gap - s / 2, gy * gap - s / 2, s, s)
        }
      }
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = cv.clientWidth
      H = cv.clientHeight
      gap = W < 700 ? 28 : 34
      cv.width = Math.ceil(W * dpr)
      cv.height = Math.ceil(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawBase()
      if (still) ctx.drawImage(base, 0, 0, W, H + gap * MAJOR)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    resize()
    if (still) return () => ro.disconnect()

    // ---- pointer ----
    const target = { x: -9999, y: -9999 } // client coordinates
    const lens = { x: 0, y: 0 } // smoothed, canvas coordinates
    let usingPointer = false
    let presence = 0 // 0..1, how strongly the cursor lights the grid
    let lastMove = -1e9
    let offset = 0 // lattice scroll offset in px (unwrapped)
    const ripples = []

    const onMove = (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      target.x = e.clientX
      target.y = e.clientY
      if (!usingPointer) {
        const r = cv.getBoundingClientRect()
        lens.x = e.clientX - r.left
        lens.y = e.clientY - r.top
      }
      usingPointer = true
      lastMove = performance.now()
    }
    const onLeave = () => {
      lastMove = -1e9
    }
    const onDown = (e) => {
      const r = cv.getBoundingClientRect()
      const y = e.clientY - r.top
      if (y < 0 || y > H) return
      ripples.push({ x: e.clientX - r.left, wy: y + offset, t0: performance.now() })
      if (ripples.length > 4) ripples.shift()
    }
    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
    }

    // ---- packets ----
    const packets = []
    let nextSpawn = 0

    const spawn = (now) => {
      const cols = Math.floor(W / gap)
      const rows = Math.ceil(H / gap)
      const top = Math.ceil(offset / gap)
      let gx
      let gy
      if (presence > 0.4 && Math.random() < 0.5) {
        gx = Math.round(lens.x / gap)
        gy = Math.round((lens.y + offset) / gap)
      } else {
        gx = Math.floor(Math.random() * (cols + 1))
        gy = top + Math.floor(Math.random() * rows)
      }
      packets.push({
        gx,
        gy,
        dir: DIRS[(Math.random() * 4) | 0],
        t: 0,
        steps: 12 + ((Math.random() * 22) | 0),
        speed: 3 + Math.random() * 2.5, // cells per second
        trail: [[gx, gy]],
        color: PACKET_COLORS[(Math.random() * PACKET_COLORS.length) | 0],
        born: now,
        dying: 0,
      })
    }

    const stepPacket = (p, dt) => {
      p.t += dt * p.speed
      while (p.t >= 1) {
        p.t -= 1
        p.gx += p.dir[0]
        p.gy += p.dir[1]
        p.trail.push([p.gx, p.gy])
        if (p.trail.length > 9) p.trail.shift()
        p.steps -= 1
        // Route like a trace: mostly straight, sometimes a 90 degree turn.
        if (Math.random() < 0.28) {
          const turn = p.dir[0] === 0 ? DIRS[(Math.random() * 2) | 0] : DIRS[2 + ((Math.random() * 2) | 0)]
          p.dir = turn
        }
      }
    }

    const drawPacket = (p, alpha) => {
      const pts = p.trail.map(([x, y]) => [x * gap, y * gap - offset])
      const head = [(p.gx + p.dir[0] * p.t) * gap, (p.gy + p.dir[1] * p.t) * gap - offset]
      pts.push(head)
      ctx.lineWidth = 1.5
      for (let i = 1; i < pts.length; i += 1) {
        ctx.strokeStyle = rgba(p.color, (i / pts.length) * 0.5 * alpha)
        ctx.beginPath()
        ctx.moveTo(pts[i - 1][0], pts[i - 1][1])
        ctx.lineTo(pts[i][0], pts[i][1])
        ctx.stroke()
      }
      ctx.fillStyle = rgba(p.color, 0.85 * alpha)
      ctx.shadowColor = rgba(p.color, alpha)
      ctx.shadowBlur = 10
      ctx.fillRect(head[0] - 2, head[1] - 2, 4, 4)
      ctx.shadowBlur = 0
    }

    // ---- frame ----
    let raf = 0
    let running = false
    let last = 0

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      const rect = cv.getBoundingClientRect()
      offset = window.scrollY * PARALLAX
      const period = gap * MAJOR

      // Lens position: the cursor on desktop, a slow wandering light otherwise.
      const active = usingPointer && now - lastMove < 2600
      let tx
      let ty
      if (usingPointer) {
        tx = target.x - rect.left
        ty = target.y - rect.top
      } else {
        const s = now / 1000
        tx = W * (0.5 + 0.34 * Math.sin(s * 0.21))
        ty = H * (0.5 + 0.3 * Math.sin(s * 0.33 + 1.3))
      }
      const k = Math.min(1, dt * 9)
      lens.x += (tx - lens.x) * k
      lens.y += (ty - lens.y) * k
      const want = usingPointer ? (active ? 1 : 0.35) : 0.45
      presence += (want - presence) * Math.min(1, dt * 2.5)

      ctx.clearRect(0, 0, W, H)
      ctx.drawImage(base, 0, -(offset % period), W, H + period)

      // Soft light pool under the lens.
      const R = Math.max(150, Math.min(240, W * 0.16))
      if (presence > 0.02) {
        const g = ctx.createRadialGradient(lens.x, lens.y, 0, lens.x, lens.y, R * 1.3)
        g.addColorStop(0, rgba(CYAN, 0.1 * presence))
        g.addColorStop(1, rgba(CYAN, 0))
        ctx.fillStyle = g
        ctx.fillRect(lens.x - R * 1.3, lens.y - R * 1.3, R * 2.6, R * 2.6)
      }

      // Brightness each dot gets from the lens and from any ripples.
      const light = (x, y) => {
        let e = 0
        const d = Math.hypot(x - lens.x, y - lens.y)
        if (d < R) {
          const t = 1 - d / R
          e = t * t * presence
        }
        for (const rp of ripples) {
          const age = (now - rp.t0) / 1000
          const rr = age * 520
          const dd = Math.abs(Math.hypot(x - rp.x, y - (rp.wy - offset)) - rr)
          if (dd < 22) e += (1 - dd / 22) * Math.max(0, 1 - age / 0.9) * 0.8
        }
        return Math.min(1, e)
      }

      // Lit dots: only cells near the lens or a ripple ring are visited.
      const lit = new Map() // grid key -> [x, y, energy] (null when dark)
      const key = (gx, gy) => gy * 4096 + gx
      const visit = (cx, cy, r) => {
        const x0 = Math.max(0, Math.floor((cx - r) / gap))
        const x1 = Math.ceil((cx + r) / gap)
        const y0 = Math.floor((cy + offset - r) / gap)
        const y1 = Math.ceil((cy + offset + r) / gap)
        for (let gy = y0; gy <= y1; gy += 1) {
          for (let gx = x0; gx <= x1; gx += 1) {
            const k = key(gx, gy)
            if (lit.has(k)) continue
            const x = gx * gap
            const y = gy * gap - offset
            const e = y < -gap || y > H + gap || x > W + gap ? 0 : light(x, y)
            if (e < 0.02) {
              lit.set(k, null)
              continue
            }
            // Bend away from the lens, like light through glass.
            const dx = x - lens.x
            const dy = y - lens.y
            const d = Math.hypot(dx, dy) || 1
            const push = e * 7
            lit.set(k, [x + (dx / d) * push, y + (dy / d) * push, e])
          }
        }
      }
      // Lit patch: the grid lines between lit dots glow first, then the dots on top.
      const paintLit = () => {
        ctx.lineWidth = 1
        for (const [k, p] of lit) {
          if (!p) continue
          for (const n of [lit.get(k + 1), lit.get(k + 4096)]) {
            if (!n) continue
            const e = Math.min(p[2], n[2])
            ctx.strokeStyle = rgba(mix(CYAN, MAGENTA, Math.min(1, e * e)), e * 0.5)
            ctx.beginPath()
            ctx.moveTo(p[0], p[1])
            ctx.lineTo(n[0], n[1])
            ctx.stroke()
          }
        }
        for (const p of lit.values()) {
          if (!p) continue
          const e = p[2]
          const s = 2 + e * 2.2
          ctx.fillStyle = rgba(mix(CYAN, MAGENTA, Math.min(1, e * e * 0.9)), Math.min(0.95, 0.15 + e * 0.8))
          ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s)
        }
      }
      if (presence > 0.02) visit(lens.x, lens.y, R)
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const rp = ripples[i]
        const age = (now - rp.t0) / 1000
        if (age > 0.9) {
          ripples.splice(i, 1)
          continue
        }
        visit(rp.x, rp.wy - offset, age * 520 + 24)
      }
      paintLit()

      // Packets.
      const cap = W < 700 ? 2 : 4
      if (now > nextSpawn && packets.length < cap) {
        spawn(now)
        nextSpawn = now + 700 + Math.random() * 1500
      }
      for (let i = packets.length - 1; i >= 0; i -= 1) {
        const p = packets[i]
        stepPacket(p, dt)
        if (p.steps <= 0 && !p.dying) p.dying = now
        const fadeIn = Math.min(1, (now - p.born) / 300)
        const fadeOut = p.dying ? 1 - (now - p.dying) / 500 : 1
        const y = p.gy * gap - offset
        if (fadeOut <= 0 || y < -gap * 12 || y > H + gap * 12 || p.gx < -12 || p.gx * gap > W + gap * 12) {
          packets.splice(i, 1)
          continue
        }
        drawPacket(p, fadeIn * fadeOut)
      }
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      rootMargin: '100px 0px',
    })
    io.observe(wrap.current)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrap} className="deck__bg" aria-hidden="true">
      <canvas ref={canvas} className="deck__canvas" />
    </div>
  )
}
