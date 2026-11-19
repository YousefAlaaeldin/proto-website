import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import './App.css'
import {
  navItems,
  hero,
  experience,
  education,
  certifications,
  projectFilters,
  featuredProjects,
  moreProjects,
  publications,
  patent,
  skillsByDomain,
  contact,
} from './content'

const projectGridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
}

const projectCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 14,
    scale: 0.985,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
}

function App() {
  const badgeRef = useRef(null)
  const backgroundCanvasRef = useRef(null)
  const mousePositionRef = useRef({ x: -9999, y: -9999 })
  const showPcbLinesRef = useRef(true)
  const [showMoreProjects, setShowMoreProjects] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [showPcbLines, setShowPcbLines] = useState(true)

  const matchesFilter = (project) =>
    activeFilter === 'All' || project.category === activeFilter

  const visibleFeaturedProjects = featuredProjects.filter(matchesFilter)
  const visibleMoreProjects = moreProjects.filter(matchesFilter)

  useEffect(() => {
    if (!badgeRef.current) return

    gsap.to(badgeRef.current, {
      y: -12,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, [])

  useEffect(() => {
    showPcbLinesRef.current = showPcbLines
  }, [showPcbLines])

  useEffect(() => {
    if (!backgroundCanvasRef.current) return

    const canvas = backgroundCanvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    const traces = Array.from({ length: 34 }, (_, index) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      angle: Math.random() * Math.PI * 2,
      angleDrift: (Math.random() - 0.5) * 0.03,
      speed: 0.3 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      orbit: 8 + Math.random() * 24,
      segment: 20 + Math.random() * 44,
      width: Math.random() > 0.75 ? 1.8 : 1.1,
      color: index % 4 === 0 ? '#fbbf24' : '#36cfc9',
      bend: Math.random() > 0.5 ? 'x-first' : 'y-first',
    }))

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onMouseMove = (event) => {
      mousePositionRef.current = { x: event.clientX, y: event.clientY }
    }

    const onMouseLeave = () => {
      mousePositionRef.current = { x: -9999, y: -9999 }
    }

    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    let animationFrameId
    let time = 0

    const drawGrid = () => {
      const step = 56
      context.save()
      context.strokeStyle = 'rgba(54, 207, 201, 0.06)'
      context.lineWidth = 1

      for (let x = 0; x <= window.innerWidth; x += step) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, window.innerHeight)
        context.stroke()
      }

      for (let y = 0; y <= window.innerHeight; y += step) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(window.innerWidth, y)
        context.stroke()
      }

      context.restore()
    }

    const render = () => {
      time += 1
      context.fillStyle = 'rgba(13, 27, 42, 0.2)'
      context.fillRect(0, 0, window.innerWidth, window.innerHeight)
      drawGrid()

      if (showPcbLinesRef.current) {
        const { x: mouseX, y: mouseY } = mousePositionRef.current
        traces.forEach((trace, index) => {
          const repelRadius = 170
          const dxMouse = trace.x - mouseX
          const dyMouse = trace.y - mouseY
          const distanceFromMouse = Math.hypot(dxMouse, dyMouse)

          if (distanceFromMouse > 0 && distanceFromMouse < repelRadius) {
            const repelStrength = ((repelRadius - distanceFromMouse) / repelRadius) * 0.75
            trace.vx += (dxMouse / distanceFromMouse) * repelStrength
            trace.vy += (dyMouse / distanceFromMouse) * repelStrength
          }

          trace.angle += trace.angleDrift
          trace.vx += Math.cos(trace.angle + trace.phase) * 0.012
          trace.vy += Math.sin(trace.angle + trace.phase) * 0.012
          trace.vx *= 0.965
          trace.vy *= 0.965
          trace.x += trace.vx + Math.cos(time * 0.01 + index) * 0.18
          trace.y += trace.vy + Math.sin(time * 0.008 + index) * 0.18

          if (trace.x < -30) trace.x = window.innerWidth + 30
          if (trace.x > window.innerWidth + 30) trace.x = -30
          if (trace.y < -30) trace.y = window.innerHeight + 30
          if (trace.y > window.innerHeight + 30) trace.y = -30

          const wobbleX = Math.sin(time * 0.012 + trace.phase) * trace.orbit
          const wobbleY = Math.cos(time * 0.01 + trace.phase) * trace.orbit
          const startX = trace.x + wobbleX
          const startY = trace.y + wobbleY
          const endX = startX + Math.cos(trace.angle) * trace.segment
          const endY = startY + Math.sin(trace.angle) * trace.segment

          const cornerX = trace.bend === 'x-first' ? endX : startX
          const cornerY = trace.bend === 'x-first' ? startY : endY
          const alpha = distanceFromMouse < 200 ? 0.22 : 0.53

          context.beginPath()
          context.strokeStyle = `${trace.color}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`
          context.shadowColor = trace.color
          context.shadowBlur = 6
          context.lineWidth = trace.width
          context.moveTo(startX, startY)
          context.lineTo(cornerX, cornerY)
          context.lineTo(endX, endY)
          context.stroke()

          context.shadowBlur = 0
          context.fillStyle = `${trace.color}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`
          context.fillRect(endX - 1.5, endY - 1.5, 3, 3)
        })
      }

      context.globalAlpha = 1
      animationFrameId = window.requestAnimationFrame(render)
    }

    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <>
      <canvas
        ref={backgroundCanvasRef}
        className="pointer-events-none fixed inset-0 z-0"
      />
      <button
        type="button"
        onClick={() => setShowPcbLines((value) => !value)}
        className="fixed bottom-4 right-4 z-40 rounded-full border border-white/35 bg-slate-950/75 px-4 py-2 text-xs uppercase tracking-wider text-slate-100 backdrop-blur transition hover:bg-slate-900/85"
      >
        background: {showPcbLines ? 'On' : 'Off'}
      </button>
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-24 px-4 pb-14 pt-6 sm:px-6 md:px-10">
        <header className="sticky top-4 z-30">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-slate-950/60 px-4 py-3 backdrop-blur-lg md:px-6">
            <a href="#about" className="font-['Syne'] text-lg font-bold tracking-wide sm:text-xl md:text-2xl">
              YOUSEF ABDOU
            </a>
            <nav className="hidden items-center gap-5 text-base text-slate-200 lg:flex">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="capitalize transition hover:text-[#36cfc9]"
                >
                  {item}
                </a>
              ))}
            </nav>
            <a
              href="#contact"
              className="shrink-0 rounded-full border border-white/30 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 sm:text-base"
            >
              Let&apos;s Talk
            </a>
          </div>
        </header>

        {/* ---------- About ---------- */}
        <motion.section
          id="about"
          className="scroll-mt-28 grid items-start gap-8 md:grid-cols-[1.2fr_0.8fr]"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm tracking-wider text-slate-200"
            >
              {hero.tag}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="font-['Syne'] text-[2.6rem] leading-tight tracking-tight sm:text-5xl md:text-7xl"
            >
              {hero.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg text-slate-300 md:text-xl"
            >
              {hero.intro}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <a
                href="#projects"
                className="rounded-full bg-[#36cfc9] px-6 py-3 text-lg font-medium text-slate-900 transition hover:bg-[#45dfd8]"
              >
                View Projects
              </a>
              <a
                href="#experience"
                className="rounded-full border border-white/30 bg-white/5 px-6 py-3 text-lg font-medium text-slate-100 transition hover:bg-white/15"
              >
                Experience
              </a>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.4 }}
              className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {hero.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/15 bg-slate-950/35 px-3 py-3 backdrop-blur"
                >
                  <dt className="font-['Syne'] text-lg text-[#36cfc9] lg:text-xl">{stat.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-slate-300">{stat.label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2 }}
            className="relative rounded-3xl border border-white/25 bg-slate-950/35 p-6 backdrop-blur"
          >
            <div
              ref={badgeRef}
              className="absolute -top-4 right-5 rounded-full bg-[#fbbf24] px-4 py-2 text-xs font-semibold text-slate-900"
            >
              {hero.now.badge}
            </div>
            <p className="text-base uppercase tracking-widest text-slate-300/90">
              {hero.now.label}
            </p>
            <h2 className="mt-3 font-['Syne'] text-3xl leading-tight">
              {hero.now.heading}
            </h2>
            <p className="mt-4 text-lg text-slate-300">{hero.now.body}</p>
            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="text-sm uppercase tracking-widest text-[#fbbf24]">Patent</p>
              <p className="mt-1 font-['Syne'] text-lg">{patent.title}</p>
              <p className="text-sm text-slate-300">{patent.detail}</p>
            </div>
          </motion.div>
        </motion.section>

        {/* ---------- Experience ---------- */}
        <motion.section
          id="experience"
          className="scroll-mt-28"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <SectionHeading kicker="01" title="Experience" />
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <ol className="relative space-y-6 border-s border-[#36cfc9]/40 ps-6">
              {experience.map((job, index) => (
                <motion.li
                  key={job.role}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="relative rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur"
                >
                  <span className="absolute -start-[2.05rem] top-6 h-3 w-3 rounded-sm border border-[#36cfc9] bg-[#0d1b2a] shadow-[0_0_10px_#36cfc9]" />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="font-['Syne'] text-xl">{job.role}</h4>
                    <p className="text-sm uppercase tracking-wider text-[#fbbf24]">{job.period}</p>
                  </div>
                  <p className="mt-1 text-base text-[#36cfc9]">
                    {job.org} · <span className="text-slate-400">{job.place}</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-base text-slate-300">
                    {job.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#36cfc9]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/20 bg-white/8 px-2.5 py-1 text-xs uppercase tracking-wider text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.li>
              ))}
            </ol>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/20 bg-slate-950/40 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-widest text-slate-300">Education</p>
                <ul className="mt-4 space-y-4">
                  {education.map((item) => (
                    <li key={item.degree}>
                      <p className="font-['Syne'] text-lg leading-snug">{item.degree}</p>
                      <p className="text-base text-[#36cfc9]">{item.school}</p>
                      <p className="text-sm text-slate-400">{item.period}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/20 bg-slate-950/40 p-5 backdrop-blur">
                <p className="text-sm uppercase tracking-widest text-slate-300">Certifications</p>
                <ul className="mt-4 space-y-2 text-base text-slate-300">
                  {certifications.map((cert) => (
                    <li key={cert} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#fbbf24]" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ---------- Projects ---------- */}
        <motion.section
          id="projects"
          className="scroll-mt-28"
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <SectionHeading kicker="02" title="Projects" />
          <div className="mb-6 flex flex-wrap gap-3">
            {projectFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-base transition ${
                  activeFilter === filter
                    ? 'border-[#36cfc9] bg-[#36cfc9] text-slate-900'
                    : 'border-white/25 bg-white/5 text-slate-200 hover:bg-white/12'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <motion.div
            layout
            variants={projectGridVariants}
            initial={false}
            animate="show"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleFeaturedProjects.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence initial={false}>
            {showMoreProjects && visibleMoreProjects.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="mt-5 overflow-hidden"
              >
                <motion.div
                  layout
                  variants={projectGridVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {visibleMoreProjects.map((project) => (
                      <ProjectCard key={project.title} project={project} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {visibleMoreProjects.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMoreProjects((value) => !value)}
                className="rounded-full border border-white/35 bg-white/5 px-5 py-2.5 text-base font-medium text-slate-100 transition hover:bg-white/15"
              >
                {showMoreProjects ? 'Show fewer projects' : `Show ${visibleMoreProjects.length} more projects`}
              </button>
            </div>
          )}
          {visibleFeaturedProjects.length === 0 && visibleMoreProjects.length === 0 && (
            <p className="mt-6 text-center text-base text-slate-300">
              No projects found for this filter yet.
            </p>
          )}
        </motion.section>

        {/* ---------- Research ---------- */}
        <motion.section
          id="research"
          className="scroll-mt-28"
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <SectionHeading kicker="03" title="Research & Publications" />
          <div className="grid gap-5 md:grid-cols-2">
            {publications.map((pub, index) => (
              <motion.article
                key={pub.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex flex-col rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm uppercase tracking-wider text-[#36cfc9]">{pub.venue}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      pub.status.startsWith('Accepted')
                        ? 'bg-[#36cfc9] text-slate-900'
                        : 'border border-[#fbbf24]/60 text-[#fbbf24]'
                    }`}
                  >
                    {pub.status}
                  </span>
                </div>
                <h4 className="mt-3 font-['Syne'] text-lg leading-snug">{pub.title}</h4>
                <p className="mt-auto pt-4 text-base text-slate-400">{pub.authors}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ---------- Skills ---------- */}
        <motion.section
          id="skills"
          className="scroll-mt-28"
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <SectionHeading kicker="04" title="Skills" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {skillsByDomain.map((group, groupIndex) => (
              <motion.article
                key={group.domain}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: groupIndex * 0.08 }}
                className="rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur"
              >
                <h4 className="font-['Syne'] text-xl">{group.domain}</h4>
                <p className="mt-2 text-base text-slate-300">{group.focus}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-sm uppercase tracking-wider text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ---------- Contact ---------- */}
        <motion.section
          id="contact"
          className="scroll-mt-28"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="rounded-3xl border border-white/20 bg-slate-950/40 p-6 backdrop-blur sm:p-8">
            <p className="text-base uppercase tracking-[0.2em] text-slate-300">Contact</p>
            <h3 className="mt-3 font-['Syne'] text-3xl">
              Have a project or a role in mind? Let&apos;s build it.
            </h3>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Based in Abu Dhabi, UAE. Email me at{' '}
              <a href={`mailto:${contact.email}`} className="text-[#36cfc9] hover:underline">
                {contact.email}
              </a>{' '}
              or connect on LinkedIn and GitHub.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href={`mailto:${contact.email}`}
                className="rounded-full bg-[#36cfc9] px-5 py-2.5 font-medium text-slate-900 transition hover:bg-[#45dfd8]"
              >
                Send Email
              </a>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/30 px-5 py-2.5 text-slate-100 transition hover:bg-white/10"
              >
                LinkedIn
              </a>
              <a
                href={contact.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/30 px-5 py-2.5 text-slate-100 transition hover:bg-white/10"
              >
                GitHub
              </a>
            </div>
          </div>
        </motion.section>

        <footer className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Yousef Abdou · The Tech Polymath
        </footer>
      </main>
    </>
  )
}

function SectionHeading({ kicker, title }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="font-mono text-sm text-[#fbbf24]">{kicker}</span>
      <h3 className="font-['Syne'] text-3xl tracking-tight">{title}</h3>
      <span className="h-px flex-1 bg-gradient-to-r from-[#36cfc9]/60 to-transparent" />
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <motion.article
      layout
      variants={projectCardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col rounded-2xl border border-white/20 bg-white/5 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.22)] backdrop-blur transition-colors hover:border-[#36cfc9]/60"
    >
      <h4 className="font-['Syne'] text-xl leading-snug">{project.title}</h4>
      {project.status && (
        <span className="mt-2 self-start rounded-full border border-[#fbbf24]/60 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[#fbbf24]">
          {project.status}
        </span>
      )}
      <p className="mt-3 text-base text-slate-300">{project.summary}</p>
      {project.highlight && (
        <p className="mt-3 text-sm font-medium text-slate-100">▸ {project.highlight}</p>
      )}
      <p className="mt-4 text-sm uppercase tracking-wider text-[#36cfc9]">{project.stack}</p>
      <div className="mt-auto pt-5">
        {project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full border border-white/30 px-3 py-1.5 text-sm uppercase tracking-wider text-slate-100 transition hover:bg-white/10"
          >
            View on GitHub
          </a>
        ) : (
          <span className="inline-flex rounded-full border border-dashed border-white/20 px-3 py-1.5 text-sm uppercase tracking-wider text-slate-400">
            Not public
          </span>
        )}
      </div>
    </motion.article>
  )
}

export default App
