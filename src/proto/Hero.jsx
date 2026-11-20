import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { coreFields, hero } from '../content'
import { Scramble } from './Scramble'
import SignalTerrain from './SignalTerrain'
import { Drive, reducedMotion } from './motion'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const span = (p, a, b) => clamp01((p - a) / (b - a))

// A synthwave landscape of signal traces runs to a neon sun. The intro raises the terrain;
// scrolling flies you forward, sinks the camera and sets the sun, then the copy fades out.
// The terrain only redraws when the intro, scroll or cursor changes it.
export default function Hero({ booted, onPickField }) {
  const section = useRef(null)
  const stage = useRef(null)
  const [drive] = useState(() => new Drive())
  const introOn = booted

  useEffect(() => {
    const el = stage.current
    if (reducedMotion()) {
      drive.set('intro', 1)
      el.style.setProperty('--exit', 0)
      return undefined
    }
    const apply = (p) => {
      drive.set('scroll', span(p, 0, 0.9))
      el.style.setProperty('--rise', span(p, 0.02, 0.3))
      el.style.setProperty('--exit', span(p, 0.86, 1))
    }
    apply(0)
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => apply(self.progress),
    })
    return () => st.kill()
  }, [drive])

  // The terrain rises out of the flat grid once the boot intro hands over.
  useEffect(() => {
    if (!booted || reducedMotion()) return undefined
    const state = { v: drive.intro }
    const tween = gsap.to(state, { v: 1, duration: 2.4, ease: 'power2.out', delay: 0.2, onUpdate: () => drive.set('intro', state.v) })
    return () => tween.kill()
  }, [booted, drive])

  return (
    <section id="top" ref={section} className="hero" aria-label="Introduction">
      <div ref={stage} className={`hero__stage ${introOn ? 'is-on' : ''}`}>
        <div className="hero__sky" aria-hidden="true" />
        <SignalTerrain drive={drive} />

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

        <p className="hero__cue" aria-hidden="true">
          Scroll to fly in
        </p>
      </div>
    </section>
  )
}
