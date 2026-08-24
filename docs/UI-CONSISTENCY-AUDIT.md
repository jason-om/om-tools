# UI consistency audit

Scope: all six rendered pages (`/`, `/clients`, `/team`, `/tools`, `/auth`,
`/admin/access`) and the four stylesheets they load. Read-only audit — no
markup, props, classes, or behavior were changed to produce it.

Method: static cross-reference of every `className` in the six page files
against every selector in `app/globals.css`, `app/clients/clients.css`,
`app/team/team.css`, and `app/tools/tools.css`, plus visual comparison of each
page in light and dark at 1440x900 and 800px.

## Status

Findings 1 and 7 were fixed on 2026-08-24 — see "What was fixed" at the end of
this document. The rest are still open; the tables below describe the codebase
as audited.

## Summary

| # | Finding | Severity | Pages |
|---|---|---|---|
| 1 | Two design systems stacked in `globals.css`; 55 legacy classes dead, 6 still live | High | `/auth`, `/admin/access` |
| 2 | App shell duplicated in all four dashboard pages, so theme and sidebar state reset on navigation | High | `/`, `/clients`, `/team`, `/tools` |
| 3 | `⌘K` hint shown on four pages, handler implemented on one | High | `/clients`, `/team`, `/tools` |
| 4 | Topbar profile and notification buttons inert on three pages | High | `/clients`, `/team`, `/tools` |
| 5 | Overview page header off-system vs the other three | Medium | `/` |
| 6 | `tools.css` silently overrides `globals.css` at equal specificity | Medium | `/tools` |
| 7 | Near-duplicate palette values; brand tokens re-typed as literals | Medium | all |
| 8 | Dark theme coverage uneven across stylesheets | Medium | `/team` |
| 9 | Focus-visible rings on two of four dashboard pages | Medium | `/`, `/team` |
| 10 | Three byte-identical heading blocks under three different class names | Low | `/clients`, `/team`, `/tools` |
| 11 | 12 classes applied in markup with no CSS anywhere | Low | all |
| 12 | Breakpoint ladder diverges above 980px | Low | all |
| 13 | Same icon for two nav destinations; view-mode labels differ per page | Low | all |
| 14 | Type and radius scales are effectively unbounded | Low | all |

## 1. Two design systems stacked in `globals.css`

`globals.css` contains two complete, unrelated systems end to end:

- **Bytes 0–20,214** — a warm "paper/ink" system: `--ink #20201e`, `--paper
  #f4f1ea`, `--line #dedad0`, `--accent #ff5b3b`, `--lime #c9ef66`. 230
  selectors.
- **Bytes 20,214–65,264** — the current OM brand system: `--om-dark-blue`,
  `--om-cobalt`, `--om-border`, `--font-headline`, `--font-body`. 415 selectors.

Of the legacy classes, **55 are referenced by no page at all** — `.app`,
`.card`, `.work-row`, `.timeline`, `.welcome`, `.horizons`, `.week-grid`,
`.modal`, `.overlay`, `.search`, `.user`, and 44 more. That is roughly 20KB
shipped to every visitor for markup that no longer exists.

Six legacy classes *are* still live, and these are the ones that matter,
because they style live UI with the **warm palette** while everything around
them uses the cool one:

| Class | Used by | Legacy token it pulls |
|---|---|---|
| `.or` | `/auth` | `--muted`, `--line` |
| `.code-inputs` | `/auth` | — |
| `.totp` | `/auth` | — |
| `.trust` | `/auth` | `--muted` |
| `.table-head` | `/admin/access` | `--muted`, `--line` |
| `.deny` | `/admin/access` | `--muted`, `--line` |

`--line` is `#dedad0` (warm beige); the surrounding `--om-border` is `#dfe5ef`
(cool blue-grey). `--muted` is `#74716a` against `--om-muted` `#58677d`. So the
divider on the `/auth` "or" row and the header rule plus Deny button on
`/admin/access` are drawn in a different colour family than the page they sit
in.

Worth stating plainly: the rest of `/auth` and `/admin/access` **is** correctly
branded — the OM region re-defines `.auth-shell`, `.auth-card`, `.auth-aside`,
and the admin shell. Only these six are stranded.

## 2. App shell duplicated per page

`app/layout.tsx` renders only `{children}`. Each of the four dashboard pages
carries its own full copy of `<aside className="om-sidebar">` and `<header
className="om-topbar">`. The four copies are structurally identical — the only
intended difference is which nav link carries `active`.

The consequence is state, not markup: `dark` and `collapsed` are `useState` in
each page and nothing persists them. Toggle dark mode on `/`, click Clients,
and you land in light mode. Same for the collapsed sidebar. Because these are
full page navigations, the shell remounts every time.

Related: `/clients` and `/team` persist their view mode to `localStorage`
(`om-clients-view`, `om-team-view`), but `/tools` has an equivalent
grid/cards/list `ViewMode` and persists nothing. Theme and collapse persist
nowhere.

## 3. `⌘K` hint without a handler

All four dashboard pages render `<kbd>⌘K</kbd>` in the topbar search. Only
`app/page.tsx` installs a `keydown` listener for it. On `/clients`, `/team`,
and `/tools` the affordance is advertised and does nothing.

## 4. Inert topbar controls

On `/` the notification bell and profile button open modals. On `/clients`,
`/team`, and `/tools` the same two buttons are rendered with identical markup
and styling — including the `3` unread badge — and **no `onClick` at all**.
They look live, they highlight on hover, they do nothing.

`/` also carries two extra topbar buttons (Meeting, Client) the other three
lack. That may well be deliberate for Overview; flagging it so the choice is
explicit rather than incidental.

Search itself is built two different ways: `/` uses `<button
className="top-search">` opening a modal; the other three use `<label
className="top-search">` wrapping a live `<input>`.

## 5. Overview header is off-system

`/clients`, `/team`, and `/tools` share one header pattern — eyebrow `<p>`,
`<h1>`, subtitle `<span>`, and a stat `<aside>`. `/` uses `.greeting`, which
diverges on every value:

| | `.greeting` (`/`) | `.*-heading` (other three) |
|---|---|---|
| `h1` | `700 23px/1.15` | `700 29px/1` |
| `h1` tracking | `-.025em` | `-.03em` |
| eyebrow | `11px`, `--om-text`, no tracking | `9px`, `--om-cobalt`, `800`, `.14em` |
| subtitle | `<small>` `12px` `--om-text` | `<span>` `12px` `--om-muted` |
| spacing | `margin-bottom:27px` | `padding-bottom:27px` |
| alignment | `align-items:end` | `align-items:flex-end` |
| stat aside | none | present |

## 6. `tools.css` overrides `globals.css` at equal specificity

Five rules exist in both files with the same selector and different values.
`tools.css` wins only because it is imported second:

| Selector | `globals.css` | `tools.css` |
|---|---|---|
| `.bento-grid` | `grid-auto-rows:164px` | `grid-auto-rows:218px` |
| `.tool-meta` | `grid-template-columns:1fr 1fr` | `repeat(3,minmax(0,1fr))` |
| `.bento-grid .tool-card:not(.tool-rank-0) .tool-meta` | `display:none` | `display:grid` |
| `.bento-grid .tool-card:not(.tool-rank-0) .tool-card-copy` | `margin-bottom:auto` | `margin:10px 0 5px` |
| `.bento-grid .tool-card:not(.tool-rank-0)` | — | `padding-bottom:20px` |

The `display:none` → `display:grid` pair is the sharp one: `globals.css`
deliberately hides tool metadata on non-hero bento cards and `tools.css`
silently un-hides it. Whichever is intended, the other is dead code that will
resurface the moment import order changes.

## 7. Palette drift

Brand tokens exist and are then re-typed as literals elsewhere:

| Literal | Count | Existing token |
|---|---|---|
| `#7054f5` | 9 (7 in globals, 2 in team.css) | `--om-purple` |
| `#fff` | 12 | `--om-surface` |
| `#f4eb2d` | 2 | `--om-yellow` |
| `#46c3fc` | 1 | `--om-sky-blue` |
| `#38e426` | 1 | `--om-green` |
| `#ff850d` | 1 | `--om-orange` |

Separately there are clusters of near-identical values that are almost
certainly meant to be one colour:

- Purple: `#7054f5`, `#7054f5`→`#7556e8` (×8), `#7255e8`, `#7356e8`, `#7556f0`
- Blue: `#278ae7`, `#287ce8`, `#297de5`
- Green: `#22aa78`, `#209d72`, `#20a878`, `#16805d`
- Orange: `#ec812c`, `#ff970a`

Totals: 144 hardcoded hex uses across 99 distinct values in the OM region of
`globals.css`, 22/22 in `clients.css`, 15/14 in `team.css`. `tools.css` uses
zero hardcoded colours — it is the one file already doing this right.

## 8. Dark theme coverage is uneven

| File | Hardcoded colours | `[data-theme=dark]` overrides |
|---|---|---|
| `globals.css` (OM region) | 144 | 4 |
| `clients.css` | 22 | 3 |
| `team.css` | 15 | **0** |
| `tools.css` | 0 | 0 (needs none) |

`team.css` hardcodes 15 colours and provides no dark variant for any of them.
The page still reads acceptably in dark because most of its surface comes from
tokenised globals, but every colour it sets itself is locked to its light
value.

## 9. Focus rings on half the pages

`:focus-visible` appears 3× in `clients.css`, 3× in `tools.css`, and **zero
times** in `globals.css` and `team.css`. The shared shell — sidebar nav links,
topbar buttons, collapse toggle — is styled entirely in `globals.css` and
therefore has no visible keyboard focus state on any page.

## 10. Three identical heading blocks, three names

`.clients-heading`, `.team-heading`, and `.tools-heading` are byte-identical
across all eight of their rules except `aside { min-width }` — 190px / 174px /
164px — and a property-order difference in the base rule. They live in three
different files (`.tools-heading` is in `globals.css`, the other two in their
page CSS), so a change to the pattern has to be made three times.

## 11. Classes applied with no CSS

Twelve classes appear in markup and match no selector in any stylesheet:

`needs-panel`, `mentions-panel`, `pulse-panel`, `schedule-panel`,
`clients-dashboard`, `team-dashboard`, `tools-dashboard`, `list-client-detail`,
`bento-card`, `planning-day`, `planning-week`, `planning-month` (and the other
horizon variants — `planning-view` itself *is* styled, the per-horizon suffixes
are not).

Harmless at runtime. They read as intentional hooks, which makes them
misleading — the page-level ones especially, since `tools-dashboard` sits next
to `om-dashboard` which *is* styled.

## 12. Breakpoint ladder diverges

| File | max-width breakpoints |
|---|---|
| `globals.css` (OM region) | 680, 980, 1200, 1280 |
| `clients.css` | 680, 900, 980, 1200 |
| `team.css` | 680, 980, 1280 |
| `tools.css` | 680, 980 |

680 and 980 are universal. Above that it splits: `clients.css` reflows at
1200, `team.css` at 1280, and `globals.css` uses both. Between 1200 and 1280
the shell and the clients grid are on one layout while team is on another.

## 13. Nav and control labels

- The sidebar uses `<Users/>` for **both** Clients and Team. Two destinations,
  one icon.
- The same view-switcher concept is labelled differently per page: Clients
  `Cards | List`, Team `Cards | Columns | List`, Tools `Grid | Cards | List`.
  Tools uses "Grid" and "Cards" for what Clients calls "Cards" and "List".
- `top-search` modifier naming: `clients-search`, `team-search`, but
  `tools-top-search`.
- Arrow-function param naming in the duplicated shell: `e` in `page.tsx` and
  `tools/page.tsx`, `event` in `clients/page.tsx` and `team/page.tsx`.

## 14. Unbounded type and radius scales

No shared scale exists. Distinct values in use:

| File | font-size | border-radius |
|---|---|---|
| `globals.css` (OM region) | 23 | 11 |
| `clients.css` | 13 | 8 |
| `team.css` | 11 | 7 |

The OM region alone uses 23 distinct font sizes including `5px`, `5.5px`,
`6px`, `7.5px`, `8.5px`, `9.5px`, and `11.5px`. Sub-pixel steps at that size
are not perceptible as hierarchy — `8px` vs `8.5px` reads as noise, and `5px`
text is below the legibility floor on most displays. Radii run 3, 4, 5, 6, 7,
8, 9, 10, 11, 14, 999 — eleven values where three or four would carry the same
meaning.

## Suggested order of work

All of the below reuses existing tokens and classes; none requires new props,
new classes, or markup restructuring.

**Tier 1 — no visual change, pure removal or substitution**

1. Delete the 55 dead legacy classes from `globals.css` (~20KB).
2. Replace the 26 literal hexes that exactly equal an existing token with
   `var(--om-*)`.
3. Resolve the five `tools.css` / `globals.css` collisions by deleting the
   losing rule.
4. Remove the 12 unused classNames, or add the rules they imply.

**Tier 2 — visible, small, and clearly correct**

5. Repoint the six live legacy rules from `--muted`/`--line` to
   `--om-muted`/`--om-border`.
6. Add `:focus-visible` to the shell controls in `globals.css`, matching the
   ring already defined in `clients.css` and `tools.css`.
7. Give `team.css` the dark overrides its 15 hardcoded colours need.
8. Pick 1200 or 1280 and align all four files.

**Tier 3 — needs a decision from you**

9. Move the shell into `app/layout.tsx` and lift `dark`/`collapsed` to it, so
   theme survives navigation. This is the fix for #2, #3, and #4 at once, and
   it is the only item here that touches component structure.
10. Either wire `⌘K`, the bell, and the profile button on the three pages, or
    remove the affordances until they are real.
11. Decide whether `.greeting` should adopt the `.*-heading` pattern.
12. Collapse the three heading blocks into one shared selector.
13. Agree a type and radius scale and round the outliers onto it. Partially
    addressed — see "Sitewide type bump" below — but the set of allowed values
    is still unbounded.


---

# What was fixed (2026-08-24)

Scope was limited to the two findings that are pure deletion or token
substitution. No new classes, no new props, no markup restructuring, and no
intended visual change.

## Finding 1 — legacy design system removed

- **154 dead legacy rules deleted**, including four entirely dead `@media`
  blocks (900px, 620px, 1100px, 700px) and four dead `[data-theme=dark]`
  overrides.
- The live legacy rules — the auth and superadmin **structure**, which the OM
  region only ever patched colours onto — were kept and repointed to brand
  tokens:

  | Legacy | Brand |
  |---|---|
  | `--ink` ×6 | `--om-text` |
  | `--muted` ×10 | `--om-muted` |
  | `--line` ×11 | `--om-border` |
  | `--card` ×3 | `--om-surface` |
  | `--paper` ×1 | `--om-page` |
  | `--nav` ×1 | `--om-dark-blue` |
  | `--lime` ×3 | `--om-sky-blue` |
  | `--accent` ×2 | `--om-cobalt` (modal label), `--om-red` (admin badge) |

  Plus 17 raw warm hexes mapped onto the brand greys and `--om-dark-blue`, and
  `.auth-card input` moved to `--om-soft` rather than the page ground.

- `body` was on `--paper` (#f4f1ea warm) with `font-family:Arial` — now
  `--om-page` and `var(--font-body)`.
- Three `Georgia` serif headings replaced with `var(--font-headline)`.
- The legacy `:root` and its `[data-theme=dark]` token block were deleted once
  nothing referenced them.

`globals.css`: **65,266 → 52,129 bytes (-20%)**. Zero legacy tokens, zero
`Georgia`, zero `Arial` remain in any stylesheet.

## Finding 7 — brand tokens re-typed as literals

13 literals that exactly equalled an existing token replaced with `var()`:
`#7054f5` ×9 → `--om-purple`, `#f4eb2d` ×2 → `--om-yellow`, and one each of
`#46c3fc`, `#38e426`, `#ff850d`.

`#fff` was deliberately **left alone**. `--om-surface` is `#fff` in light but
`#101f2d` in dark, so substituting it would have inverted white text sitting on
the dark-blue panels.

## Also removed

`app/layout.tsx` loaded Geist and Geist Mono via `next/font` and applied
`--font-geist-sans`, `--font-geist-mono`, and `antialiased` to `<body>`.
Nothing referenced any of them — the stylesheets use `--font-headline` and
`--font-body`, and `antialiased` is a Tailwind utility that generates no rule
because no stylesheet imports Tailwind. Verified in the browser
(`--font-geist-sans` resolved empty, `webkitFontSmoothing: auto`) before
removing. Two webfont families no longer download.

## Verification

`tsc --noEmit` clean, `eslint` clean, 6/6 render tests pass. All six pages
compared before and after at 1440x900 and 850px in light and dark, plus the
Overview quick-search modal. A computed-style sweep over every element on
`/auth`, `/admin/access`, and `/` (light and dark) returns **zero** remaining
legacy palette values.

## Known gap, unchanged

The `.focus-card` on Overview still renders light in dark mode. That is
finding 8 (uneven dark coverage), not a regression from this work.


---

# Sitewide type bump (2026-08-24)

Every `font-size` and the size inside every `font:` shorthand, across all four
stylesheets, multiplied by **1.10** and rounded to the nearest 0.5px. Widths,
heights, padding, radii, and letter-spacing were not touched, so the layout
grid is unchanged and only the text inside it grew.

Body copy moves 9px → 10px and 10px → 11px; the largest headings move 29px →
32px. Relative hierarchy is preserved because every value scaled by the same
factor.

## One deliberate exception

`.panel-title h2` and `.dash-panel>header button` were held at their original
10px. At 1.10 they became 11px, which pushed "TODAY'S SCHEDULE" and its "View
calendar" link onto two lines inside the fixed 48px panel header. The dashboard
panel header is the one place in the layout with no horizontal slack. Holding
the panel chrome at its original size while the panel *content* grows keeps
every header on one line.

Note that "CLIENT / PROJECT PULSE" still wraps to two lines. That is
pre-existing, not a result of this change — measured at 20px tall on the
original stylesheets too.

## Why 1.10 rather than more

1.15 was tried first and rejected: it wrapped the panel headers even with the
exception above, and truncated more of the client pulse rows.

## Verification

Lint, `tsc --noEmit`, and 6/6 render tests pass. All six pages checked at
1440x900 and 680x900 in light and dark. A DOM sweep at 680px found no element
overflowing its container and no horizontal page scroll.
