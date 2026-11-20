// Procedural cover art per project, drawn in its domain colour. Seeded by title so it is stable.

function rng(seedText) {
  let h = 2166136261
  for (let i = 0; i < seedText.length; i += 1) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619)
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const KIND = {
  'Smart Vent v2': { img: '/proto/smartvent.png' },
  'Real-Time Structural Break Detection': { img: '/proto/break.png' },
  'AI World': { kind: 'graph' },
  'Machine Agent': { kind: 'graph' },
  'School Bus Safety Tracker': { kind: 'route' },
  'DataCrunch 2': { kind: 'bars' },
  'Synth Volatility Tracker': { kind: 'bars' },
  'Throat-Mic Comms': { kind: 'wave' },
  'Tefa Care': { kind: 'grid' },
  'Quantum Circuit Compilation': { kind: 'wires' },
  'NFL Big Data Bowl 2027': { kind: 'tracks' },
  'tiny-gpu (fork)': { kind: 'die' },
}

function Art({ kind, r, c }) {
  const W = 320
  const H = 180
  if (kind === 'graph') {
    const nodes = Array.from({ length: 14 }, () => [20 + r() * (W - 40), 20 + r() * (H - 40)])
    const edges = nodes.flatMap((a, i) => nodes.slice(i + 1).filter((b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 90).map((b) => [a, b]))
    return (
      <>
        {edges.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeOpacity="0.45" />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 5 : 3} fill={i % 4 === 0 ? c : '#05080F'} stroke={c} />
        ))}
      </>
    )
  }
  if (kind === 'route') {
    const pts = Array.from({ length: 9 }, (_, i) => [20 + i * 35, 40 + r() * 100])
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}H${p[0] + 17}`).join('')
    return (
      <>
        <path d={d} fill="none" stroke={c} strokeWidth="3" />
        {pts.map(([x, y], i) => (
          <rect key={i} x={x - 5} y={y - 5} width="10" height="10" fill="#05080F" stroke={c} strokeWidth="2" />
        ))}
      </>
    )
  }
  if (kind === 'bars') {
    return Array.from({ length: 32 }, (_, i) => {
      const v = Math.exp(-((i - 16) ** 2) / 40) * (0.6 + r() * 0.4)
      const h = 12 + v * 140
      return <rect key={i} x={12 + i * 9.4} y={H - 12 - h} width="6" height={h} fill={c} fillOpacity={0.25 + v * 0.75} />
    })
  }
  if (kind === 'wave') {
    const d = Array.from({ length: 161 }, (_, i) => {
      const x = i * 2
      const env = Math.sin((i / 160) * Math.PI)
      const y = H / 2 + Math.sin(i * 0.35) * 50 * env * (0.6 + 0.4 * Math.sin(i * 0.07))
      return `${i ? 'L' : 'M'}${x} ${y.toFixed(1)}`
    }).join('')
    return <path d={d} fill="none" stroke={c} strokeWidth="2.5" />
  }
  if (kind === 'grid') {
    return Array.from({ length: 12 * 7 }, (_, i) => {
      const x = (i % 12) * 26 + 6
      const y = Math.floor(i / 12) * 24 + 6
      return r() > 0.55 ? <rect key={i} x={x} y={y} width="20" height="18" fill={c} fillOpacity={0.2 + r() * 0.8} /> : null
    })
  }
  if (kind === 'wires') {
    return (
      <>
        {Array.from({ length: 6 }, (_, w) => (
          <line key={`w${w}`} x1="10" x2={W - 10} y1={22 + w * 27} y2={22 + w * 27} stroke={c} strokeOpacity="0.5" />
        ))}
        {Array.from({ length: 16 }, (_, i) => {
          const w = Math.floor(r() * 6)
          return <rect key={i} x={20 + i * 18} y={12 + w * 27} width="14" height="20" fill="#05080F" stroke={c} strokeWidth="1.5" />
        })}
      </>
    )
  }
  if (kind === 'tracks') {
    return Array.from({ length: 7 }, (_, k) => {
      let x = 10
      let y = 30 + r() * 120
      const pts = []
      for (let i = 0; i < 22; i += 1) {
        x += 13
        y += (r() - 0.5) * 18
        pts.push([x, y])
      }
      return (
        <g key={k}>
          {pts.map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={i === pts.length - 1 ? 3.5 : 1.4} fill={c} fillOpacity={0.3 + (i / pts.length) * 0.7} />
          ))}
        </g>
      )
    })
  }
  if (kind === 'die') {
    return Array.from({ length: 8 * 4 }, (_, i) => (
      <rect key={i} x={24 + (i % 8) * 35} y={18 + Math.floor(i / 8) * 38} width="28" height="30" fill="none" stroke={c} strokeOpacity={r() > 0.7 ? 1 : 0.35} strokeWidth="1.5" />
    ))
  }
  return null
}

export default function CardVisual({ project, color }) {
  const spec = KIND[project.title] ?? { kind: 'graph' }
  if (spec.img) return <img src={spec.img} alt="" loading="lazy" draggable="false" />
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Art kind={spec.kind} r={rng(project.title)} c={color} />
    </svg>
  )
}
