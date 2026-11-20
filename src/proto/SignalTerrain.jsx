import { useEffect, useRef } from 'react'
import { reducedMotion } from './motion'

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
const TRAVEL = 26 // world units flown forward over the whole hero scroll
// World-space spacing of samples along a ridge: fine up close, coarser in the distance.
const stepFor = (z) => (z > 20 ? 1.8 : z > 10 ? 0.9 : 0.45)
// Resting mountain when no cursor is over the page (and on touch screens).
const REST = { x: 3, z: 9, amp: 1.6 }

// Hero backdrop: a wireframe landscape where every ridge line is a signal trace, running to a
// banded sun. It is still unless something changes: the cursor pulls a peak up on the skyline
// (or raises one at the ground point under it), and scrolling flies forward while the camera
// sinks and the sun sets. Frames are drawn only on those events, plus a short settle after them.
// `drive` (a Drive from motion.js) carries { intro, scroll } (0..1) and tells us when they change.
export default function SignalTerrain({ drive }) {
  const canvas = useRef(null)

  useEffect(() => {
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const still = reducedMotion()
    let W = 0
    let H = 0
    let visible = true

    const pointer = { x: 0, y: 0, active: false }
    const bump = { ...REST }

    function draw(dt) {
      const { intro, scroll } = drive
      const rise = still ? 1 : easeOut(Math.min(1, intro))
      const wide = W >= 900
      const hor = H * HORIZON
      const f = H * (wide ? 0.78 : 0.95)
      const camH = 2.3 - scroll * 0.6
      const cx = wide ? W * 0.66 : W * 0.5
      const travel = scroll * TRAVEL

      // In the sky, the cursor pulls a peak up toward itself on the skyline; over the ground,
      // the mountain rises at the point under it.
      let { x: tx, z: tz, amp: ta } = REST
      if (pointer.active && !still) {
        const below = pointer.y - hor
        if (below > 12) {
          tz = Math.min(22, Math.max(2.6, (camH * f) / below))
          ta = 3.4
        } else {
          tz = 12
          ta = Math.min(5, camH - 0.9 + ((hor - pointer.y) * tz) / f)
        }
        tx = ((pointer.x - cx) * tz) / f
      }
      const k = Math.min(1, dt * 6)
      bump.x += (tx - bump.x) * k
      bump.z += (tz - bump.z) * k
      bump.amp += (ta - bump.amp) * k
      const settling = Math.abs(tx - bump.x) + Math.abs(tz - bump.z) + Math.abs(ta - bump.amp) > 0.02

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
      ctx.fillStyle = BG
      for (let i = 0; i < 8; i += 1) ctx.fillRect(cx - sr, sy + sr * (0.04 + i * 0.14), sr * 2, 1.5 + i * 1.5)
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

      // Ridges back to front. Each one is filled down to its own ground line to hide the
      // ridges behind it (those never reach below it), not to the bottom of the screen.
      const off = travel % DZ
      const base = Math.floor(travel / DZ)
      const xs = []
      const ys = []
      for (let r = ROWS; r >= 0; r -= 1) {
        const z = NEAR + r * DZ - off
        const zAbs = (base + r) * DZ
        const scale = f / z
        const step = stepFor(z)
        const x0 = Math.floor((-cx / scale - 1) / step) * step
        const x1 = (W - cx) / scale + 1 + step
        xs.length = 0
        ys.length = 0
        for (let x = x0; x <= x1; x += step) {
          xs.push(cx + x * scale)
          ys.push(hor + (camH - height(x, zAbs, z)) * scale)
        }
        const n = xs.length
        const ground = Math.min(H, hor + camH * scale) + 1

        ctx.beginPath()
        ctx.moveTo(xs[0], ground)
        for (let i = 0; i < n; i += 1) ctx.lineTo(xs[i], ys[i])
        ctx.lineTo(xs[n - 1], ground)
        ctx.closePath()
        ctx.fillStyle = BG
        ctx.fill()

        const t = r / ROWS
        const fadeFar = r > ROWS - 4 ? (ROWS - r) / 4 : 1
        const fadeNear = Math.min(1, (z - NEAR + DZ) / DZ)
        ctx.beginPath()
        ctx.moveTo(xs[0], ys[0])
        for (let i = 1; i < n; i += 1) ctx.lineTo(xs[i], ys[i])
        ctx.strokeStyle = rgba(mix(CYAN, VIOLET, t), 0.85 * (1 - t * 0.7) * fadeFar * fadeNear)
        ctx.lineWidth = r < 6 ? 1.6 : 1
        ctx.stroke()
      }
      return settling
    }

    // ---- on-demand frames ----
    let raf = 0
    let last = 0
    const frame = (now) => {
      raf = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (draw(dt) && visible) invalidate()
    }
    function invalidate() {
      if (raf || !W) return
      if (!last) last = performance.now() - 16
      raf = requestAnimationFrame(frame)
    }

    const resize = () => {
      // 1x is plenty for thin glowing lines and keeps every redraw cheap on high-DPI screens.
      const dpr = 1
      W = cv.clientWidth
      H = cv.clientHeight
      cv.width = Math.ceil(W * dpr)
      cv.height = Math.ceil(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (still) draw(1)
      else invalidate()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    resize()
    if (still) return () => ro.disconnect()

    const unlisten = drive.listen(invalidate)
    const onMove = (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      const r = cv.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      pointer.active = pointer.y >= 0 && pointer.y <= r.height
      if (visible) invalidate()
    }
    const onLeave = () => {
      pointer.active = false
      if (visible) invalidate()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) invalidate()
    })
    io.observe(cv)

    return () => {
      cancelAnimationFrame(raf)
      unlisten()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [drive])

  return <canvas ref={canvas} className="hero__terrain" aria-hidden="true" />
}
