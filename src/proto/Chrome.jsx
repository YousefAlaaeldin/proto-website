import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { finePointer, reducedMotion, scrollState, scrollToTarget } from './motion'

// Reticle cursor: trails the pointer, locks onto links and buttons, and names what a click does.
export function Cursor() {
  const ring = useRef(null)
  const [label, setLabel] = useState('')
  const [active, setActive] = useState(false)
  const [enabled] = useState(() => finePointer() && !reducedMotion())

  useEffect(() => {
    if (!enabled) return undefined
    document.documentElement.classList.add('has-reticle')
    const x = gsap.quickTo(ring.current, 'x', { duration: 0.22, ease: 'power3' })
    const y = gsap.quickTo(ring.current, 'y', { duration: 0.22, ease: 'power3' })

    const onMove = (e) => {
      const target = e.target.closest?.('a, button, [data-cursor]')
      if (target && target.matches('a, button')) {
        const r = target.getBoundingClientRect()
        x(r.left + r.width / 2)
        y(r.top + r.height / 2)
      } else {
        x(e.clientX)
        y(e.clientY)
      }
      setActive(Boolean(target))
      setLabel(target?.closest('[data-cursor]')?.getAttribute('data-cursor') ?? '')

      // Magnetic pull on buttons that opt in.
      document.querySelectorAll('[data-magnetic]').forEach((m) => {
        const r = m.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const near = Math.hypot(dx, dy) < 90
        gsap.to(m, { x: near ? dx * 0.25 : 0, y: near ? dy * 0.25 : 0, duration: 0.35, ease: 'power3' })
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.classList.remove('has-reticle')
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={ring} className={`reticle ${active ? 'is-active' : ''}`} aria-hidden="true">
      <span className="reticle__ring" />
      <span className="reticle__tick reticle__tick--n" />
      <span className="reticle__tick reticle__tick--e" />
      <span className="reticle__tick reticle__tick--s" />
      <span className="reticle__tick reticle__tick--w" />
      {label && <span className="reticle__label">{label}</span>}
    </div>
  )
}

const NAV = [
  ['projects', 'Work', false],
  ['experience', 'Experience', true],
  ['research', 'Research', true],
  ['skills', 'Skills', true],
  ['contact', 'Contact', false],
]

// Top bar with a live oscilloscope trace whose amplitude follows scroll speed.
export function NavBar() {
  const canvas = useRef(null)

  useEffect(() => {
    const c = canvas.current
    const ctx = c.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = 120
    const H = 28
    c.width = W * dpr
    c.height = H * dpr
    ctx.scale(dpr, dpr)
    let phase = 0
    let amp = 2
    const draw = () => {
      const v = Math.min(Math.abs(scrollState.velocity), 50)
      amp += (2 + v * 0.45 - amp) * 0.15
      phase += 0.08 + v * 0.01
      ctx.clearRect(0, 0, W, H)
      ctx.beginPath()
      for (let x = 0; x <= W; x += 2) {
        const y = H / 2 + Math.sin(x * 0.12 + phase) * amp * Math.sin((x / W) * Math.PI)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#4FE3F0'
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#4FE3F0'
      ctx.shadowBlur = 6
      ctx.stroke()
    }
    if (reducedMotion()) {
      draw()
      return undefined
    }
    gsap.ticker.add(draw)
    return () => gsap.ticker.remove(draw)
  }, [])

  const go = (target) => (event) => {
    event.preventDefault()
    scrollToTarget(target)
  }

  return (
    <header className="nav">
      <a href="#top" className="nav__logo" onClick={go('#top')}>
        Y/ABDOU
      </a>
      <canvas ref={canvas} className="nav__scope" style={{ width: 120, height: 28 }} aria-hidden="true" />
      <nav aria-label="Sections" className="nav__links">
        {NAV.map(([id, label, extra]) => (
          <a key={id} href={`#${id}`} onClick={go(`#${id}`)} className={extra ? 'is-extra' : undefined}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}

const RAIL = [
  { id: 'top', label: 'Board' },
  { id: 'projects', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'research', label: 'Research' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

// Progress rail drawn as a PCB trace, with a pad per section.
export function Rail() {
  const fill = useRef(null)
  const [pads, setPads] = useState([])
  const [current, setCurrent] = useState('top')

  useEffect(() => {
    // Absolute page offsets (getBoundingClientRect works inside pinned sections; offsetTop does not).
    const pageTop = (el) => el.getBoundingClientRect().top + window.scrollY
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPads(
        RAIL.map((s) => {
          const el = document.getElementById(s.id)
          return { ...s, at: el && max > 0 ? Math.min(1, Math.max(0, pageTop(el) / max)) : 0 }
        }),
      )
    }
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        scrollState.progress = self.progress
        if (fill.current) fill.current.style.transform = `scaleY(${self.progress})`
        // Current section: the last one whose top has passed the middle of the screen.
        const mid = window.innerHeight * 0.5
        let id = RAIL[0].id
        RAIL.forEach((s) => {
          const el = document.getElementById(s.id)
          if (el && el.getBoundingClientRect().top <= mid) id = s.id
        })
        if (self.progress > 0.995) id = RAIL[RAIL.length - 1].id
        setCurrent(id)
      },
      onRefresh: measure,
    })
    measure()
    return () => st.kill()
  }, [])

  return (
    <nav className="rail" aria-label="Page progress">
      <span className="rail__line" />
      <span ref={fill} className="rail__fill" />
      {pads.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`rail__pad ${current === p.id ? 'is-current' : ''}`}
          style={{ top: `${p.at * 100}%` }}
          onClick={() => scrollToTarget(`#${p.id}`)}
          aria-label={`Go to ${p.label}`}
        >
          <span>{p.label}</span>
        </button>
      ))}
    </nav>
  )
}
