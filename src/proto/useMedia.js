import { useEffect, useState } from 'react'

// True while the media query matches; updates when it changes.
export function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export const COMPACT = '(max-width: 899px), (prefers-reduced-motion: reduce)'

// True once the element has scrolled into view (stays true).
export function useInView(ref, margin = '0px 0px -15% 0px') {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, margin, seen])
  return seen
}
