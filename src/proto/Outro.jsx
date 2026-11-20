import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { contact } from '../content'
import { Scramble } from './Scramble'

export default function Outro({ onReplay }) {
  const section = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const st = ScrollTrigger.create({ trigger: section.current, start: 'top 75%', once: true, onEnter: () => setOn(true) })
    return () => st.kill()
  }, [])

  return (
    <section id="contact" ref={section} className="outro" aria-labelledby="contact-title">
      <div className="outro__term">
        <p className="outro__prompt">
          <span aria-hidden="true">&gt; </span>
          <Scramble text="connect --to yousef" play={on} duration={900} />
          <span className="outro__cursor" aria-hidden="true" />
        </p>
        <h2 id="contact-title" className="outro__title">
          Have a project or a role in mind?
        </h2>
        <p className="outro__text">
          Email <a href={`mailto:${contact.email}`}>{contact.email}</a>, or find me on GitHub and LinkedIn.
        </p>
        <div className="outro__actions">
          <a className="btn btn--solid" href={`mailto:${contact.email}`} data-magnetic>
            Send email
          </a>
          <a className="btn" href={contact.github} target="_blank" rel="noreferrer" data-magnetic>
            GitHub
          </a>
          <a className="btn" href={contact.linkedin} target="_blank" rel="noreferrer" data-magnetic>
            LinkedIn
          </a>
        </div>
      </div>

      <aside className="outro__next" aria-label="Prototype scope">
        <p className="outro__next-title">This prototype covers the boot, the board, the wipe and the project stream.</p>
        <p>In the full build: a pinned experience HUD with counting metrics, papers that decrypt as they scroll in, and skills as a six-core chip die.</p>
        <button type="button" className="btn" onClick={onReplay}>
          Replay the intro
        </button>
      </aside>
    </section>
  )
}
