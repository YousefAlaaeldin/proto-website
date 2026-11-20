import { useLayoutEffect, useRef } from 'react'
import { scrambleTo } from './motion'

// Text that decodes when `play` turns true (and again whenever `replay` changes).
// Screen readers get the plain text; the animated copy is hidden from them.
// The final text is rendered first, so if animation frames never run the words are still there.
export function Scramble({ text, play = true, replay = 0, duration, delay, className }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    if (!play) return undefined
    return scrambleTo(ref.current, text, { duration, delay })
  }, [text, play, replay, duration, delay])
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {play ? text : ' '}
      </span>
    </span>
  )
}
