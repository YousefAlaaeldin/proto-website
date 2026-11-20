import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { featuredProjects, moreProjects } from '../content'
import CardVisual from './CardVisual'
import { Scramble } from './Scramble'
import { domainColor, reducedMotion, scrollState } from './motion'

const projects = [...featuredProjects, ...moreProjects.slice(0, 4)]

function Card({ project, index }) {
  const [hovered, setHovered] = useState(0)
  const color = domainColor[project.category] ?? '#4FE3F0'
  return (
    <article
      className="card"
      style={{ '--c': color }}
      onPointerEnter={() => setHovered((n) => n + 1)}
      data-cursor={project.link ? 'Open repo' : 'Private'}
    >
      <div className="card__visual">
        <CardVisual project={project} color={color} />
        <span className="card__sweep" aria-hidden="true" />
      </div>
      <div className="card__body">
        <p className="card__meta">
          <span>{project.category}</span>
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
export default function ProjectStream() {
  const section = useRef(null)
  const track = useRef(null)
  const bar = useRef(null)
  const [titleOn, setTitleOn] = useState(false)

  useEffect(() => {
    const reduced = reducedMotion()
    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => track.current.scrollWidth - window.innerWidth + 64
      gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onEnter: () => setTitleOn(true),
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
          },
        },
      })

      const skew = gsap.quickTo(track.current, '--skew', { duration: 0.4, ease: 'power3' })
      const split = gsap.quickTo(track.current, '--split', { duration: 0.4, ease: 'power3' })
      const tick = () => {
        const v = Math.max(-40, Math.min(40, scrollState.velocity))
        skew(v * -0.18)
        split(Math.abs(v) * 0.12)
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    })

    if (reduced || window.innerWidth < 900) {
      const st = ScrollTrigger.create({ trigger: section.current, start: 'top 70%', once: true, onEnter: () => setTitleOn(true) })
      return () => {
        st.kill()
        mm.revert()
      }
    }
    return () => mm.revert()
  }, [])

  return (
    <section id="projects" ref={section} className="stream" aria-labelledby="stream-title">
      <header className="stream__head">
        <h2 id="stream-title" className="stream__title">
          <Scramble text="Selected work" play={titleOn} duration={700} />
        </h2>
        <ul className="stream__legend" aria-label="Colour key">
          {Object.entries(domainColor)
            .filter(([k]) => k !== 'Game Dev')
            .map(([k, c]) => (
              <li key={k} style={{ '--c': c }}>
                {k}
              </li>
            ))}
        </ul>
      </header>
      <div className="stream__viewport">
        <div ref={track} className="stream__track">
          {projects.map((project, index) => (
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
