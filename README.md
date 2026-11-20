# The Tech Polymath

Source for [thetechpolymath.net](https://thetechpolymath.net), Yousef Abdou's portfolio.

A single-page site in a light-grid, neon-HUD style: a boot intro, a generated circuit board that powers up as you scroll, a horizontal project stream filtered by field, a pinned experience timeline, research, and a six-core "chip" of skills.

Built with React 19 and Vite. Motion uses GSAP with ScrollTrigger and Lenis smooth scrolling, and every animation has a reduced-motion fallback.

## Editing

- **Content:** experience, projects, publications, skills and contact details all live in [`src/content.js`](src/content.js).
- **Sections:** one component per section in [`src/proto/`](src/proto). Styles are in `proto.css` and `sections.css`.
- **Hero board:** the circuit board is synthetic, not a real design. Regenerate it with `node scripts/generate-board.mjs [seed]`, which writes `src/proto/pcbData.js`.
- **Replay the intro:** add `?boot` to the URL. Otherwise it plays once per browser session.

## Run

```bash
npm install
npm run dev     # local dev server
npm run build   # production build in dist/
npm run lint
```

## Deploy

Vercel builds and deploys every push to `main` to production. Pushes to other branches get a preview URL.
