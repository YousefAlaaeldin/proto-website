import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Boot from './Boot'
import Hero from './Hero'
import DataWipe from './DataWipe'
import ProjectStream from './ProjectStream'
import Outro from './Outro'
import { Cursor, NavBar, Rail } from './Chrome'
import { reducedMotion, scrollState } from './motion'
import './proto.css'

gsap.registerPlugin(ScrollTrigger)

const BOOT_KEY = 'tp-booted'

function shouldBoot() {
  if (reducedMotion()) return false
  if (new URLSearchParams(window.location.search).has('boot')) return true
  try {
    return !window.sessionStorage.getItem(BOOT_KEY)
  } catch {
    return true
  }
}

export default function Proto() {
  const [booted, setBooted] = useState(() => !shouldBoot())

  // Smooth scroll, wired into GSAP's ticker so ScrollTrigger and Lenis share one clock.
  useEffect(() => {
    if (reducedMotion()) return undefined
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    window.__lenis = lenis
    lenis.on('scroll', (e) => {
      scrollState.velocity = e.velocity
      ScrollTrigger.update()
    })
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      window.__lenis = undefined
    }
  }, [])

  // Hold the page still while the intro runs.
  useEffect(() => {
    document.documentElement.classList.toggle('is-booting', !booted)
    if (!booted) window.__lenis?.stop()
    else {
      window.__lenis?.start()
      ScrollTrigger.refresh()
    }
  }, [booted])

  const finishBoot = () => {
    try {
      window.sessionStorage.setItem(BOOT_KEY, '1')
    } catch {
      /* storage unavailable: intro will simply play again next visit */
    }
    setBooted(true)
  }

  const replay = () => {
    window.scrollTo(0, 0)
    window.__lenis?.scrollTo(0, { immediate: true })
    setBooted(false)
  }

  return (
    <div className="tp">
      <Cursor />
      <NavBar />
      <Rail />
      {!booted && <Boot onDone={finishBoot} />}
      <main>
        <Hero booted={booted} />
        <DataWipe label="selected work" />
        <ProjectStream />
        <Outro onReplay={replay} />
      </main>
    </div>
  )
}
