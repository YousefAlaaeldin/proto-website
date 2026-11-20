import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { reducedMotion } from './motion'

const format = (v, decimals) => (decimals ? v.toFixed(decimals) : String(Math.round(v)))

// Counts from zero to `value` whenever `run` changes. The final number is always rendered
// first and restored at the end, so a stalled animation never leaves a wrong figure.
export default function CountUp({ value, decimals = 0, suffix = '', run }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return undefined
    const state = { v: 0 }
    const tween = gsap.to(state, {
      v: value,
      duration: 1.1,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = format(state.v, decimals)
      },
      onComplete: () => {
        el.textContent = format(value, decimals)
      },
    })
    const safety = setTimeout(() => {
      el.textContent = format(value, decimals)
    }, 1600)
    return () => {
      tween.kill()
      clearTimeout(safety)
      el.textContent = format(value, decimals)
    }
  }, [value, decimals, run])
  return (
    <span>
      <span ref={ref}>{format(value, decimals)}</span>
      {suffix}
    </span>
  )
}
