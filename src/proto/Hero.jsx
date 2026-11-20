import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { coreFields, hero } from '../content'
import { pcb } from './pcbData'
import { Scramble } from './Scramble'
import { reducedMotion, scrollState } from './motion'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const span = (p, a, b) => clamp01((p - a) / (b - a))

// Scroll flies you forward over the grid while a generated circuit board draws itself
// from the MCU outward: inner layer, back copper, front copper, vias, then parts.
// The board is synthetic (scripts/generate-board.mjs), not a real design.
export default function Hero({ booted, onPickField }) {
  const section = useRef(null)
  const stage = useRef(null)
  const floor = useRef(null)
  const [captionOn, setCaptionOn] = useState(false)
  const introOn = booted

  const parts = useMemo(
    () => pcb.parts.map(([x, y, top, w = 1.8, h = 1.1], i) => ({ x, y, top, w, h, t: ((i * 37) % 100) / 100 })),
    [],
  )

  // Board + floor driven by scroll.
  useEffect(() => {
    const el = stage.current
    const reduced = reducedMotion()
    const intro = { p: reduced ? 1 : 0 }
    let scrollP = 0

    const apply = () => {
      const p = Math.max(intro.p, scrollP)
      el.style.setProperty('--draw-i', span(p, 0.0, 0.3))
      el.style.setProperty('--draw-b', span(p, 0.05, 0.42))
      el.style.setProperty('--draw-f', span(p, 0.12, 0.55))
      el.style.setProperty('--vias', span(p, 0.25, 0.62))
      el.style.setProperty('--parts', span(p, 0.5, 0.78))
      el.style.setProperty('--rise', reduced ? 1 : span(scrollP, 0.45, 0.9))
      el.style.setProperty('--exit', span(scrollP, 0.88, 1))
      if (p > 0.82) setCaptionOn(true)
    }
    apply()

    if (reduced) return undefined

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          scrollP = self.progress
          apply()
        },
      })
      el.__intro = () => gsap.to(intro, { p: 0.3, duration: 2.2, ease: 'power2.out', onUpdate: apply })
    })

    // Floor speed follows scroll velocity: idle drift plus a surge when you scroll.
    let offset = 0
    const tick = () => {
      offset = (offset + 0.35 + Math.min(Math.abs(scrollState.velocity), 60) * 0.5) % 64
      if (floor.current) floor.current.style.backgroundPosition = `0 ${offset}px, ${0}px ${offset}px`
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (booted) stage.current?.__intro?.()
  }, [booted])

  return (
    <section id="top" ref={section} className="hero" aria-label="Introduction">
      <div ref={stage} className={`hero__stage ${introOn ? 'is-on' : ''}`}>
        <div className="hero__sky" aria-hidden="true" />
        <div className="hero__floor-wrap" aria-hidden="true">
          <div ref={floor} className="hero__floor" />
        </div>
        <div className="hero__horizon" aria-hidden="true" />

        <div className="hero__copy">
          <p className="hero__kicker">
            <Scramble text="Computer &amp; ML engineer" play={introOn} delay={200} />
          </p>
          <h1 className="hero__title">
            <Scramble text="The Tech" play={introOn} duration={700} delay={350} />
            <br />
            <Scramble text="Polymath" play={introOn} duration={800} delay={550} />
          </h1>
          <p className="hero__intro">{hero.intro}</p>
        </div>

        <ul className="hero__fields" aria-label="Core skills">
          {coreFields.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className="field-tile"
                style={{ '--c': f.color }}
                onClick={() => onPickField(f.id)}
                data-cursor="Show projects"
              >
                <span className="field-tile__name">{f.name}</span>
                <span className="field-tile__tools">{f.tools.join(' / ')}</span>
                <span className="field-tile__practice">{f.practice.join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>

        <figure className="hero__board">
          <figcaption className="hero__caption">
            <Scramble text="Generated board, routed outward from the MCU" play={captionOn} duration={1100} />
          </figcaption>
          <svg viewBox={`-3 -3 ${pcb.w + 6} ${pcb.h + 6}`} role="img" aria-label="A circuit board drawing itself trace by trace">
            <rect className="pcb__edge" x="0" y="0" width={pcb.w} height={pcb.h} rx="1.2" pathLength="1" />
            <path className="pcb__trace pcb__trace--in" d={pcb.traces['In2.Cu']} pathLength="1" />
            <path className="pcb__trace pcb__trace--back" d={pcb.traces['B.Cu']} pathLength="1" />
            <path className="pcb__trace pcb__trace--front" d={pcb.traces['F.Cu']} pathLength="1" />
            <g className="pcb__vias">
              {pcb.vias.map(([x, y, t], i) => (
                <circle key={i} cx={x} cy={y} r="0.42" style={{ '--t': t }} />
              ))}
            </g>
            <g className="pcb__parts">
              {parts.map((p, i) => (
                <rect
                  key={i}
                  x={p.x - p.w / 2}
                  y={p.y - p.h / 2}
                  width={p.w}
                  height={p.h}
                  rx="0.2"
                  className={p.top ? 'is-top' : ''}
                  style={{ '--t': p.t }}
                />
              ))}
            </g>
            <g className="pcb__mcu" transform={`translate(${pcb.mcu[0]} ${pcb.mcu[1]})`}>
              <circle r="2.2" />
              <circle r="4.5" className="pcb__mcu-ring" />
            </g>
          </svg>
        </figure>

        <p className="hero__cue" aria-hidden="true">
          Scroll to power up the board
        </p>
      </div>
    </section>
  )
}
