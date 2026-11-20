import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { scrambleTo } from './motion'

// One orchestrated entrance: a light trail streaks across, the name decodes,
// a power counter runs, then the screen splits open onto the grid.
export default function Boot({ onDone }) {
  const root = useRef(null)
  const nameRef = useRef(null)
  const pctRef = useRef(null)
  const doneRef = useRef(onDone)
  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    let finished = false
    let cancelScramble = () => {}
    const finish = () => {
      if (finished) return
      finished = true
      doneRef.current()
    }

    const ctx = gsap.context(() => {
      const counter = { v: 0 }
      gsap
        .timeline({ onComplete: finish })
        .fromTo('.boot__trail', { scaleX: 0 }, { scaleX: 1, duration: 0.75, ease: 'power3.in' })
        .to('.boot__trail-head', { opacity: 0, duration: 0.2 })
        .add(() => {
          cancelScramble = scrambleTo(nameRef.current, 'YOUSEF ABDOU', { duration: 950 })
        }, '-=0.25')
        .fromTo('.boot__meta', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 }, '<')
        .to(
          counter,
          {
            v: 100,
            duration: 1.15,
            ease: 'power1.inOut',
            onUpdate: () => {
              if (pctRef.current) pctRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
            },
          },
          '<',
        )
        .to('.boot__center', { opacity: 0, scale: 1.04, duration: 0.3 }, '+=0.15')
        .to('.boot__half--top', { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '<0.1')
        .to('.boot__half--bottom', { yPercent: 100, duration: 0.8, ease: 'expo.inOut' }, '<')
    }, root)

    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelScramble()
      ctx.revert()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={root} className="boot" role="dialog" aria-label="Loading intro">
      <div className="boot__half boot__half--top" />
      <div className="boot__half boot__half--bottom" />
      <div className="boot__center">
        <div className="boot__trail">
          <span className="boot__trail-head" />
        </div>
        <p className="boot__name">
          <span className="sr-only">Yousef Abdou</span>
          <span ref={nameRef} aria-hidden="true">
            {' '}
          </span>
        </p>
        <p className="boot__meta">
          <span>Powering the grid</span>
          <span ref={pctRef}>000</span>
        </p>
      </div>
      <button type="button" className="boot__skip" onClick={() => doneRef.current()}>
        Skip intro
      </button>
    </div>
  )
}
