# OM Tools Dashboard

A single-page internal directory for tools built by the OM DevTeam. Every entry
is an external link that opens in a new tab. There is no auth, no database, and
no second route — the dashboard is the whole app.

Replaces the generic directory previously hosted at
`om-app-directory.om-devteam.workers.dev`.

## Tools listed

| Tool | URL |
| --- | --- |
| Convert & Compress | https://convert-n-compress.om-devteam.workers.dev/ |
| Dental Website Tracker | https://dental-website-tracker.om-devteam.workers.dev/ |
| Deploys | https://deploys.omdigitalagency.com/ |
| OM Tools / Command Center | https://tools.omdigitalagency.com/login |

## The page

One route. A search box and a light/dark toggle, the heading, then a toolbar
carrying the Department filter, the sort control, and the Grid / Cards / List
view switcher. Grid is a bento that reflows by result count so a filtered view
never leaves a hole.

Theme follows the OS until someone picks a side; the choice is stored in
`localStorage` under `om-theme` and applied before first paint by the inline
bootstrap in `app/theme.tsx`, so there is no flash on reload.

## Adding a tool

1. Add an icon to `app/icons.tsx` — a 64×64 viewBox drawn with `currentColor`
   strokes, so the card tints the whole glyph with one CSS colour.
2. Add an entry to the `tools` array in `app/page.tsx` with a `tone` of
   `coral`, `blue`, `purple`, or `green`. Array order is the "Featured" sort and
   decides which tool gets the large bento tile.

Departments come from the entries themselves, so a new one appears in the filter
automatically. That is the entire change surface — no routing, no data layer.

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local dev server (vinext + Cloudflare Vite plugin) |
| `npm run build` | Production build |
| `npm run build:vercel` | Vercel/Nitro build |
| `npm start` | Serve the production build |
| `npm test` | Build, then assert the server-rendered HTML and outbound links |
| `npm run lint` | ESLint |

## Layout

```
app/
  layout.tsx    document shell, metadata, brand fonts, theme bootstrap
  page.tsx      the dashboard — tool list, filters, and the three views
  icons.tsx     inline SVG tool marks and interface icons
  theme.tsx     light/dark toggle and its pre-paint bootstrap
  globals.css   the entire stylesheet
worker/
  index.ts      Cloudflare Worker entry
tests/
  rendered-html.test.mjs
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deploy notes.
