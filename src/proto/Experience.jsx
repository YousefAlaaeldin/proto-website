import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { certifications, education, experience, hero } from '../content'
import CountUp from './CountUp'
import { Scramble } from './Scramble'
import { COMPACT, useMedia } from './useMedia'

function Metrics({ job, run }) {
  return (
    <dl className="xp__metrics">
      {job.metrics.map((m) => (
        <div key={m.label}>
          <dt>
            <CountUp value={m.value} decimals={m.decimals} suffix={m.suffix} run={run} />
          </dt>
          <dd>{m.label}</dd>
        </div>
      ))}
    </dl>
  )
}

function Points({ job }) {
  return (
    <ul className="xp__points">
      {job.points.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  )
}

// Desktop: the section pins while you scroll through the roles. The HUD swaps to the
// current role and its numbers count up; the timeline fills with light as you pass each one.
// Phones and reduced motion: the roles stack as plain cards.
export default function Experience() {
  const compact = useMedia(COMPACT)
  const track = useRef(null)
  const fill = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (compact) return undefined
    const n = experience.length
    const st = ScrollTrigger.create({
      trigger: track.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (fill.current) fill.current.style.transform = `scaleY(${self.progress})`
        setActive(Math.min(n - 1, Math.floor(self.progress * n * 0.999)))
      },
    })
    return () => st.kill()
  }, [compact])

  useEffect(() => {
    if (compact) return
    gsap.fromTo('.xp__hud-body', { opacity: 0.2, x: -12 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' })
  }, [active, compact])

  const jump = (i) => {
    const el = track.current
    const max = el.offsetHeight - window.innerHeight
    const y = el.getBoundingClientRect().top + window.scrollY + (max * (i + 0.5)) / experience.length
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1 })
    else window.scrollTo({ top: y })
  }

  const job = experience[active]

  return (
    <section id="experience" className="xp" aria-labelledby="xp-title">
      <header className="sec-head">
        <h2 id="xp-title" className="sec-title">
          Experience
        </h2>
        <p className="sec-note">Currently: {hero.now.heading.replace(' @ ', ', ')}</p>
      </header>

      {compact ? (
        <ol className="xp__stack">
          {experience.map((j) => (
            <li key={j.role} className="xp__card">
              <p className="xp__period">{j.period}</p>
              <h3 className="xp__role">{j.role}</h3>
              <p className="xp__org">
                {j.org} <span>{j.place}</span>
              </p>
              <Metrics job={j} run={0} />
              <Points job={j} />
            </li>
          ))}
        </ol>
      ) : (
        <div ref={track} className="xp__track" style={{ height: `${experience.length * 90 + 100}vh` }}>
          <div className="xp__stage">
            <aside className="xp__hud" aria-live="polite">
              <div className="xp__hud-bar">
                <span>
                  Role {active + 1} of {experience.length}
                </span>
                <span>{job.period}</span>
              </div>
              <div className="xp__hud-body">
                <h3 className="xp__role">
                  <Scramble text={job.role} play replay={active} duration={650} />
                </h3>
                <p className="xp__org">
                  {job.org} <span>{job.place}</span>
                </p>
                <Metrics job={job} run={active} />
                <ul className="xp__tags" aria-label="Tools">
                  {job.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </aside>

            <ol className="xp__timeline">
              <span className="xp__line" aria-hidden="true">
                <span ref={fill} />
              </span>
              {experience.map((j, i) => (
                <li key={j.role} className={i === active ? 'is-active' : i < active ? 'is-past' : ''}>
                  <button type="button" className="xp__node" onClick={() => jump(i)} aria-current={i === active}>
                    <span className="xp__period">{j.period}</span>
                    <span className="xp__node-role">{j.role}</span>
                    <span className="xp__node-org">{j.org}</span>
                  </button>
                  <div className="xp__detail">
                    <Points job={j} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="xp__edu">
        <div className="panel">
          <h3 className="panel__title">Education</h3>
          <ul className="edu">
            {education.map((e) => (
              <li key={e.degree}>
                <p className="edu__degree">{e.degree}</p>
                <p className="edu__school">
                  {e.school} <span>{e.period}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="panel__title">Certifications</h3>
          <ul className="certs">
            {certifications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
