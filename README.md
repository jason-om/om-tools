# OM Tools Dashboard

A single-page internal directory for tools built by the OM DevTeam. Every entry
is an external link that opens in a new tab. Replaces the generic directory
previously hosted at `om-app-directory.om-devteam.workers.dev`.

No build step, no dependencies, no toolchain — three files served as-is by
GitHub Pages.

## Tools listed

| Tool | URL |
| --- | --- |
| Convert & Compress | https://convert-n-compress.om-devteam.workers.dev/ |
| Dental Website Tracker | https://dental-website-tracker.om-devteam.workers.dev/ |
| Deploys | https://deploys.omdigitalagency.com/ |
| OM Tools / Command Center | https://tools.omdigitalagency.com/login |

## Branches

| Branch | What it is |
| --- | --- |
| `main` | The site source. Edit here. |
| `gh-pages` | Published output, replaced by CI on every push to `main`. Do not edit. |
| `nextjs` | The earlier React + vinext/Cloudflare version, kept for reference. |

## Layout

```
index.html    the page — chrome, controls, and a <noscript> link list
app.js        the tool list plus search, filters, sort, views, and theme
styles.css    the design, light and dark
favicon.svg   tab icon
.nojekyll     tells Pages to serve the files untouched
```

## Adding a tool

Edit the `TOOLS` array in `app.js` and push. That is the whole change surface.

```js
{
  name: "Tool Name",
  description: "One short line.",
  department: "Creative",
  author: "OM DevTeam",
  url: "https://example.om-devteam.workers.dev/",
  tone: "blue",        // coral | blue | purple | green
  icon: "convert",     // a key in the ICONS map above
}
```

- **Order matters.** The array order is the "Featured" sort, and the first entry
  gets the large bento tile.
- **Departments** are derived from the entries, so a new one appears in the
  filter on its own.
- **For a new icon**, add a key to the `ICONS` map: SVG path markup on a 64×64
  viewBox using `currentColor` strokes, so the card tints the glyph with one
  colour.
- **Add the link to the `<noscript>` list** in `index.html` too, and to the URL
  list in `.github/workflows/pages.yml` if it should be checked on deploy.

## Local preview

Any static server works, because there is nothing to compile:

```bash
npx --yes serve@14 --listen 4173 .
```

## How it renders

`app.js` owns rendering: `TOOLS` is the single source of truth, and the cards,
list rows, and empty state are all generated from it. `index.html` holds the
static chrome and a `<noscript>` copy of the plain links so the page still
functions with JavaScript off.

The grid is a bento that reflows by result count, so a filtered view never
leaves a hole. Theme follows the OS until someone picks a side; the choice is
stored in `localStorage` under `om-theme` and applied before first paint by the
inline script in `index.html`, so there is no flash on reload.

## Deployment

Pushing to `main` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml),
which checks the site files and tool links, then force-pushes the static files
to `gh-pages` as a single commit.

Point Pages at the `gh-pages` branch, root folder, under **Settings → Pages**.

> Note: GitHub Pages on a **private** repository requires a paid plan. On the
> free plan, either make the repo public or host the same files elsewhere —
> they are plain static files and need no special runtime.
