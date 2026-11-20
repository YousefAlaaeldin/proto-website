import { useRef } from 'react'
import { patent, publications } from '../content'
import { Scramble } from './Scramble'
import { useInView } from './useMedia'

function Authors({ text }) {
  // Highlight my own name in the author list.
  return text.split(/(Y\. Abdou)/).map((part, i) => (part === 'Y. Abdou' ? <strong key={i}>{part}</strong> : part))
}

function Paper({ pub, index }) {
  const ref = useRef(null)
  const seen = useInView(ref)
  const accepted = pub.status.startsWith('Accepted')
  return (
    <article ref={ref} className={`paper ${seen ? 'is-seen' : ''}`} style={{ '--i': index }}>
      <div className="paper__bar">
        <span>{pub.venue}</span>
        <span className={`paper__stamp ${accepted ? 'is-accepted' : ''}`}>{pub.status}</span>
      </div>
      <h3 className="paper__title">
        <Scramble text={pub.title} play={seen} duration={1300} delay={index * 120} />
      </h3>
      <p className="paper__authors">
        <Authors text={pub.authors} />
      </p>
    </article>
  )
}

// Papers arrive as encrypted files: titles decode when they scroll into view,
// then the status stamp lands.
export default function Research() {
  const bannerRef = useRef(null)
  const seen = useInView(bannerRef)
  return (
    <section id="research" className="res" aria-labelledby="res-title">
      <header className="sec-head">
        <h2 id="res-title" className="sec-title">
          Research
        </h2>
        <p className="sec-note">Four papers on detection transformers, edge AI and decision support, plus a granted patent.</p>
      </header>

      <div ref={bannerRef} className={`patent ${seen ? 'is-seen' : ''}`}>
        <p className="patent__label">U.S. patent granted</p>
        <p className="patent__title">
          <Scramble text={patent.title} play={seen} duration={900} />
        </p>
        <p className="patent__detail">{patent.detail.replace('U.S. Patent granted · ', '')} · the basis of Smart Vent</p>
      </div>

      <div className="res__grid">
        {publications.map((pub, i) => (
          <Paper key={pub.title} pub={pub} index={i} />
        ))}
      </div>
    </section>
  )
}
