# 🌌 Cosmic Odyssey MUD

A retro cosmic JRPG / MUD that runs entirely in the browser — element-affinity
combat, party recruitment, loot & forging, a trading post, and a chapter-gated
main quest line. Built with React + Vite + Tailwind.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm test` | Run the core game-engine test suite |

## Deploy

Pushing to `main` builds and publishes to GitHub Pages automatically via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
