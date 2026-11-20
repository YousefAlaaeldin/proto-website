import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Scramble } from './Scramble'
import { reducedMotion } from './motion'

const COLORS = ['#4FE3F0', '#FF2A6D', '#FFB347']
const COLS = 16

// Scanline columns in the three domain colours sweep down, hold, then drain away,
// scrubbed by scroll. The label decodes while the screen is covered.
export default function DataWipe({ label }) {
  const section = useRef(null)
  const [labelOn, setLabelOn] = useState(false)

  useEffect(() => {
    if (reducedMotion()) return undefined
    const ctx = gsap.context(() => {
      const cols = gsap.utils.toArray('.wipe__col', section.current)
      const order = cols.map((_, i) => (i * 7) % COLS) // fixed pseudo-random stagger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top 60%',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            if (self.progress > 0.38 && self.progress < 0.72) setLabelOn(true)
          },
        },
      })
      cols.forEach((col, i) => {
        tl.fromTo(col, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.35, ease: 'power2.in' }, order[i] * 0.012)
      })
      tl.to({}, { duration: 0.15 })
      cols.forEach((col, i) => {
        tl.to(col, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.35, ease: 'power2.out' }, 0.62 + order[i] * 0.012)
      })
      tl.fromTo('.wipe__label', { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.38).to('.wipe__label', { opacity: 0, duration: 0.08 }, 0.72)
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={section} className="wipe" aria-hidden="true">
      <div className="wipe__sticky">
        {Array.from({ length: COLS }, (_, i) => (
          <span key={i} className="wipe__col" style={{ '--c': COLORS[i % 3] }} />
        ))}
        <p className="wipe__label">
          <Scramble text={`// entering ${label}`} play={labelOn} duration={700} />
        </p>
      </div>
    </div>
  )
}
