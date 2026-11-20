import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { coreFields, streamProjects } from '../content'
import CardVisual from './CardVisual'
import { Scramble } from './Scramble'
import { reducedMotion, scrollState } from './motion'

const fieldById = Object.fromEntries(coreFields.map((f) => [f.id, f]))
const NEUTRAL = '#7FA8B8'

function Card({ project, index }) {
  const [hovered, setHovered] = useState(0)
  const color = fieldById[project.fields[0]]?.color ?? NEUTRAL
  const fieldNames = project.fields.length ? project.fields.map((id) => fieldById[id].name).join(' + ') : 'Apps'
  return (
    <article
      className="card"
      style={{ '--c': color }}
      onPointerEnter={() => setHovered((n) => n + 1)}
      data-cursor={project.link ? 'Open repo' : 'Not public'}
    >
      <div className="card__visual">
        <CardVisual project={project} color={color} />
        <span className="card__sweep" aria-hidden="true" />
      </div>
      <div className="card__body">
        <p className="card__meta">
          <span>{fieldNames}</span>
          <span>{String(index + 1).padStart(2, '0')}</span>
        </p>
        <h3 className="card__title">
          <Scramble text={project.title} play replay={hovered} duration={550} />
        </h3>
        {project.status && <p className="card__status">{project.status}</p>}
        <p className="card__summary">{project.summary}</p>
        {project.highlight && <p className="card__highlight">{project.highlight}</p>}
        <p className="card__stack">{project.stack}</p>
        {project.link ? (
          <a className="card__link" href={project.link} target="_blank" rel="noreferrer" data-magnetic>
            View on GitHub
          </a>
        ) : (
          <span className="card__link is-off">Not public</span>
        )}
      </div>
    </article>
  )
}

// Vertical scroll drives the strip sideways while the section is pinned.
// Scroll speed skews the cards and splits their colour channels.
// The field buttons narrow the strip to one discipline.
export default function ProjectStream({ field, onField }) {
  const section = useRef(null)
  const track = useRef(null)
  const bar = useRef(null)
  const pinRef = useRef(null)
  const [titleOn, setTitleOn] = useState(false)

  const visible = field === 'all' ? streamProjects : streamProjects.filter((p) => p.fields.includes(field))

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(0, track.current.scrollWidth - window.innerWidth + 64)
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${Math.max(1, distance())}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onEnter: () => setTitleOn(true),
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
          },
        },
      })
      pinRef.current = tween.scrollTrigger

      const skew = gsap.quickTo(track.current, '--skew', { duration: 0.4, ease: 'power3' })
      const split = gsap.quickTo(track.current, '--split', { duration: 0.4, ease: 'power3' })
      // Only touch the track while the scroll speed is changing; at rest it costs nothing.
      let lastV = 0
      const tick = () => {
        let v = Math.max(-40, Math.min(40, scrollState.velocity))
        if (Math.abs(v) < 0.05) v = 0
        if (v === 0 && lastV === 0) return
        lastV = v
        skew(v * -0.18)
        split(Math.abs(v) * 0.12)
      }
      gsap.ticker.add(tick)
      return () => {
        gsap.ticker.remove(tick)
        pinRef.current = null
      }
    })

    const st = ScrollTrigger.create({ trigger: section.current, start: 'top 70%', once: true, onEnter: () => setTitleOn(true) })
    return () => {
      st.kill()
      mm.revert()
    }
  }, [])

  // When the field changes: re-measure the strip, return to its start, and bring the cards in.
  useEffect(() => {
    const cards = track.current.querySelectorAll('.card')
    if (!reducedMotion()) {
      gsap.fromTo(cards, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out' })
    }
    track.current.parentElement.scrollLeft = 0
    ScrollTrigger.refresh()
    const st = pinRef.current
    if (st && window.scrollY > st.start + 2) {
      if (window.__lenis) window.__lenis.scrollTo(st.start, { duration: 0.8 })
      else window.scrollTo(0, st.start)
    }
  }, [field])

  return (
    <section id="projects" ref={section} className="stream" aria-labelledby="stream-title">
      <header className="stream__head">
        <h2 id="stream-title" className="stream__title">
          <Scramble text="Selected work" play={titleOn} duration={700} />
        </h2>
        <div className="stream__filters" role="group" aria-label="Filter projects by field">
          <button type="button" className={`chip ${field === 'all' ? 'is-on' : ''}`} aria-pressed={field === 'all'} onClick={() => onField('all')}>
            All <span className="chip__count">{streamProjects.length}</span>
          </button>
          {coreFields.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip ${field === f.id ? 'is-on' : ''}`}
              style={{ '--c': f.color }}
              aria-pressed={field === f.id}
              onClick={() => onField(f.id)}
            >
              {f.name} <span className="chip__count">{streamProjects.filter((p) => p.fields.includes(f.id)).length}</span>
            </button>
          ))}
        </div>
      </header>
      <div className="stream__viewport">
        <div ref={track} className="stream__track">
          {visible.map((project, index) => (
            <Card key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
      <div className="stream__progress" aria-hidden="true">
        <span ref={bar} />
      </div>
    </section>
  )
}
