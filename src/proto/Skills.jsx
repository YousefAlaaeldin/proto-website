import { useState } from 'react'
import { skillsByDomain } from '../content'
import { Scramble } from './Scramble'

const CORES = [
  { code: 'ML', color: '#FF2A6D' },
  { code: 'LLM', color: '#9C8CFF' },
  { code: 'OPT', color: '#3DFFB0' },
  { code: 'EDGE', color: '#4FE3F0' },
  { code: 'QNT', color: '#FFB347' },
  { code: 'SW', color: '#E6F1F7' },
]

// Die geometry in a 300 x 200 box: cores on a 3 x 2 grid, each routed to the nearest edge.
const TRACES = [
  ['M50 52 H24 L14 42 V8', 'M50 52 V20 L40 10 H8'],
  ['M150 52 V8', 'M150 52 H120 L110 42 V8'],
  ['M250 52 H276 L286 42 V8', 'M250 52 V20 L260 10 H292'],
  ['M50 148 H24 L14 158 V192', 'M50 148 V180 L40 190 H8'],
  ['M150 148 V192', 'M150 148 H180 L190 158 V192'],
  ['M250 148 H276 L286 158 V192', 'M250 148 V180 L260 190 H292'],
]

// Skills as a six-core processor: each core is one area. Hover, focus or click a core to
// power it up; its traces light to the die edge and the readout lists what it runs.
export default function Skills() {
  const [active, setActive] = useState(0)
  const domain = skillsByDomain[active]
  const core = CORES[active]

  return (
    <section id="skills" className="skills" aria-labelledby="skills-title">
      <header className="sec-head">
        <h2 id="skills-title" className="sec-title">
          Skills
        </h2>
        <p className="sec-note">Six areas, one chip. Pick a core.</p>
      </header>

      <div className="skills__layout">
        <div className="die" style={{ '--c': core.color }}>
          <svg className="die__traces" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
            {TRACES.map((paths, i) =>
              paths.map((d) => (
                <path key={d} d={d} className={i === active ? 'is-on' : ''} style={{ '--tc': CORES[i].color }} vectorEffect="non-scaling-stroke" />
              )),
            )}
          </svg>
          <div className="die__grid" role="group" aria-label="Skill areas">
            {skillsByDomain.map((d, i) => (
              <button
                key={d.domain}
                type="button"
                className={`core ${i === active ? 'is-on' : ''}`}
                style={{ '--cc': CORES[i].color }}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={i === active}
              >
                <span className="core__code">{CORES[i].code}</span>
                <span className="core__name">{d.domain}</span>
              </button>
            ))}
          </div>
          <span className="die__mark" aria-hidden="true">
            YA-6C
          </span>
        </div>

        <div className="readout" style={{ '--c': core.color }} aria-live="polite">
          <p className="readout__code">{core.code} core online</p>
          <h3 className="readout__title">
            <Scramble text={domain.domain} play replay={active} duration={500} />
          </h3>
          <p className="readout__focus">{domain.focus}</p>
          <ul key={domain.domain} className="readout__list">
            {domain.items.map((item, i) => (
              <li key={item} style={{ '--i': i }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

