// Shared motion state and helpers for the prototype.

// Written by the Lenis scroll loop, read by anything that reacts to scroll speed.
export const scrollState = { velocity: 0, progress: 0 }

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const finePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

export const scrollToTarget = (target) => {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
}

// Domain colour coding: every card, trace and wipe column uses its domain's colour.
export const domainColor = {
  Hardware: '#4FE3F0',
  'AI/ML': '#FF2A6D',
  Quant: '#FFB347',
  'Web & Apps': '#9C8CFF',
  'Game Dev': '#E6F1F7',
}

const GLYPHS = '01<>/\\[]{}#%&*+=?XZ░▒▓'
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0]

// Decode `text` into `el` out of glyph noise, left to right. Returns a cancel function.
export function scrambleTo(el, text, { duration = 800, delay = 0 } = {}) {
  if (!el) return () => {}
  if (reducedMotion()) {
    el.textContent = text
    return () => {}
  }
  let raf
  let start
  // Start from noise right away, and guarantee the real text lands even if frames stall.
  el.textContent = text.replace(/\S/g, () => glyph())
  const safety = setTimeout(() => {
    cancelAnimationFrame(raf)
    el.textContent = text
  }, delay + duration * 1.2 + 400)
  const step = (now) => {
    if (start === undefined) start = now + delay
    const t = (now - start) / duration
    if (t < 0) {
      raf = requestAnimationFrame(step)
      return
    }
    let out = ''
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i]
      if (ch === ' ') out += ' '
      else out += t >= i / text.length + 0.12 ? ch : glyph()
    }
    el.textContent = out
    if (t < 1.12) raf = requestAnimationFrame(step)
    else {
      el.textContent = text
      clearTimeout(safety)
    }
  }
  raf = requestAnimationFrame(step)
  return () => {
    cancelAnimationFrame(raf)
    clearTimeout(safety)
    el.textContent = text
  }
}
