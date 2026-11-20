import { useEffect, useRef } from 'react'
import { reducedMotion, scrollState } from './motion'

const CYAN = [79, 227, 240]
const MAGENTA = [255, 42, 109]
const AMBER = [255, 179, 71]
const VIOLET = [156, 140, 255]
const BG = '#05080f'

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const easeOut = (t) => 1 - (1 - t) ** 3

export const HORIZON = 0.68 // must match .hero__fields top in proto.css
const ROWS = 40
const DZ = 0.9 // depth between ridge lines
const NEAR = 1.4
// World-space spacing of samples along a ridge: fine up close, coarser in the distance.
const stepFor = (z) => (z > 20 ? 1.8 : z > 10 ? 0.9 : 0.45)

// Hero backdrop: an endless wireframe landscape where every ridge line is a signal trace,
// flowing toward a banded sun. The cursor raises a mountain at the ground point under it,
// packets ride the ridges, and scrolling flies you forward while the camera sinks and the
// sun sets. `drive.current` carries { intro, scroll } (0..1) from the hero's scroll timeline.
export default function SignalTerrain({ drive }) {
  const canvas = useRef(null)

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const still = reducedMotion()
    let W = 0
    let H = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = cv.clientWidth
      H = cv.clientHeight
      cv.width = Math.ceil(W * dpr)
      cv.height = Math.ceil(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (still) draw(0, 0)
    }

    // ---- pointer: a ridge rises at the ground point under the cursor ----
    const pointer = { x: 0, y: 0, active: false }
    const bump = { x: 4, z: 8, amp: 0 }
    const onMove = (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      const r = cv.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      pointer.active = pointer.y >= 0 && pointer.y <= r.height
    }
    const onLeave = () => {
      pointer.active = false
    }

    const packets = Array.from({ length: 6 }, (_, i) => ({
      row: 4 + i * 6,
      x: -10 + Math.random() * 20,
      v: 3 + Math.random() * 3,
      color: i % 3 === 2 ? MAGENTA : AMBER,
    }))

    let travel = 0

    function draw(now, dt) {
      const { intro = 1, scroll = 0 } = drive.current
      const rise = still ? 1 : easeOut(Math.min(1, intro))
      const wide = W >= 900
      const hor = H * HORIZON
      const f = H * (wide ? 0.78 : 0.95)
      const camH = 2.3 - scroll * 0.6
      const cx = wide ? W * 0.66 : W * 0.5

      // Where the cursor (or, on touch screens, a slow wandering point) touches the ground.
      // In the sky, the cursor pulls a peak up toward itself on the skyline; over the ground,
      // the mountain rises at the point under it.
      let tx
      let tz
      let pull = 1.6
      if (pointer.active) {
        const below = pointer.y - hor
        if (below > 12) {
          tz = Math.min(22, Math.max(2.6, (camH * f) / below))
          pull = 3.4
        } else {
          tz = 12
          pull = Math.min(5, camH + ((hor - pointer.y) * tz) / f)
        }
        tx = ((pointer.x - cx) * tz) / f
      } else {
        const s = now / 1000
        tz = 9 + Math.sin(s * 0.23) * 4
        tx = Math.sin(s * 0.17) * 7 + 3
      }
      const k = still ? 1 : Math.min(1, dt * 3)
      bump.x += (tx - bump.x) * k
      bump.z += (tz - bump.z) * k
      bump.amp += ((still ? 0 : pull) - bump.amp) * Math.min(1, dt * 2)

      ctx.clearRect(0, 0, W, H)

      // Sun: rises with the intro, sets as you scroll. Clipped to the sky.
      const sr = wide ? Math.min(W * 0.13, H * 0.2) : Math.min(W * 0.28, H * 0.16)
      const sy = hor - sr * 0.3 + (1 - rise) * sr * 1.4 + scroll * sr * 0.9
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, W, hor)
      ctx.clip()
      const glow = ctx.createRadialGradient(cx, sy, sr * 0.6, cx, sy, sr * 2.6)
      glow.addColorStop(0, rgba(MAGENTA, 0.2 * rise))
      glow.addColorStop(1, rgba(MAGENTA, 0))
      ctx.fillStyle = glow
      ctx.fillRect(cx - sr * 2.6, sy - sr * 2.6, sr * 5.2, sr * 5.2)
      ctx.beginPath()
      ctx.arc(cx, sy, sr, 0, Math.PI * 2)
      ctx.clip()
      const sg = ctx.createLinearGradient(0, sy - sr, 0, sy + sr)
      sg.addColorStop(0, rgba(AMBER, 0.95))
      sg.addColorStop(0.55, rgba(MAGENTA, 0.92))
      sg.addColorStop(1, rgba(VIOLET, 0.7))
      ctx.fillStyle = sg
      ctx.fillRect(cx - sr, sy - sr, sr * 2, sr * 2)
      // Scanline bands drift down through the lower half.
      ctx.fillStyle = BG
      const drift = still ? 0 : ((now / 1000) * 0.08) % 0.14
      for (let i = 0; i < 8; i += 1) {
        const yy = sy + sr * (i * 0.14 + drift)
        ctx.fillRect(cx - sr, yy, sr * 2, 1.5 + i * 1.5)
      }
      ctx.restore()

      // Horizon line, drawn out from the vanishing point during the intro.
      const half = Math.max(cx, W - cx) * Math.min(1, rise * 1.4)
      ctx.fillStyle = rgba(CYAN, 0.95)
      ctx.fillRect(cx - half, hor - 1, half * 2, 2)
      const hg = ctx.createLinearGradient(0, hor - 60, 0, hor)
      hg.addColorStop(0, rgba(CYAN, 0))
      hg.addColorStop(1, rgba(CYAN, 0.16 * rise))
      ctx.fillStyle = hg
      ctx.fillRect(0, hor - 60, W, 60)

      // Terrain height: a flat valley running to the sun, ridges either side that grow
      // toward a distant skyline, plus the cursor's mountain (camera-relative).
      const height = (x, zAbs, zRel) => {
        const ax = Math.abs(x)
        const valley = Math.min(1, Math.max(0, (ax - 1.4) / 4))
        let h =
          (0.9 * Math.sin(x * 0.45 + zAbs * 0.31) * Math.sin(zAbs * 0.13 - x * 0.2) +
            0.5 * Math.sin(x * 1.1 - zAbs * 0.5) +
            0.95) *
          valley *
          (1.05 + Math.min(ax, 28) * 0.035)
        const w = 1.3 + bump.z * 0.09
        const dx = (x - bump.x) / w
        const dz = (zRel - bump.z) / (2.2 + bump.z * 0.12)
        h += bump.amp * Math.exp(-dx * dx - dz * dz)
        return Math.max(0, h) * rise
      }

      const off = travel % DZ
      const base = Math.floor(travel / DZ)
      for (let r = ROWS; r >= 0; r -= 1) {
        const z = NEAR + r * DZ - off
        const zAbs = (base + r) * DZ
        const scale = f / z
        const step = stepFor(z)
        const x0 = Math.floor((-cx / scale - 1) / step) * step
        const x1 = (W - cx) / scale + 1
        ctx.beginPath()
        let first = true
        let lastX = 0
        for (let x = x0; x <= x1 + step; x += step) {
          const px = cx + x * scale
          const py = hor + (camH - height(x, zAbs, z)) * scale
          if (first) {
            ctx.moveTo(px, H)
            first = false
          }
          ctx.lineTo(px, py)
          lastX = px
        }
        ctx.lineTo(lastX, H)
        ctx.closePath()
        ctx.fillStyle = BG
        ctx.fill()

        const t = r / ROWS
        const fadeFar = r > ROWS - 4 ? (ROWS - r) / 4 : 1
        const fadeNear = Math.min(1, (z - NEAR + DZ) / DZ)
        ctx.strokeStyle = rgba(mix(CYAN, VIOLET, t), 0.85 * (1 - t * 0.7) * fadeFar * fadeNear)
        ctx.lineWidth = r < 6 ? 1.6 : 1
        ctx.stroke() // strokes the ridge plus the two edge drops, which sit off screen

        for (const p of packets) {
          if (p.row !== r) continue
          const px = cx + p.x * scale
          const py = hor + (camH - height(p.x, zAbs, z)) * scale
          ctx.fillStyle = rgba(p.color, 0.95 * fadeNear)
          ctx.shadowColor = rgba(p.color, 1)
          ctx.shadowBlur = 12
          ctx.fillRect(px - 2.5, py - 2.5, 5, 5)
          ctx.shadowBlur = 0
        }
      }
    }

    let raf = 0
    let running = false
    let last = 0
    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      // Idle drift, a surge while scrolling, and scroll position itself moves you forward.
      travel += dt * (1.4 + Math.min(Math.abs(scrollState.velocity), 60) * 0.12)
      for (const p of packets) {
        p.x += p.v * dt
        if (p.x > 18) {
          p.x = -18
          p.row = 2 + Math.floor(Math.random() * 30)
        }
      }
      draw(now, dt)
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

    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    resize()
    if (still) return () => ro.disconnect()

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    io.observe(cv)

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [drive])

  return <canvas ref={canvas} className="hero__terrain" aria-hidden="true" />
}
