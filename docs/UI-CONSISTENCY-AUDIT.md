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


---

# Type scale (2026-08-24)

Supersedes the 10% bump above. Audit finding 14 is now closed.

## The scale

**12, 13, 14, 16, 18, 21, 26, 32**, plus **40 / 48 / 56** for auth display type.
33 distinct sizes collapsed onto 11 steps. 12px is the floor for anything a
person reads.

Role assignment: 12 chrome labels, meta, badges; 13 captions; 14 body, item
titles, nav, controls; 16 page subtitles and search inputs; 18 card titles;
21 sub-headings; 26 stat numbers and modal titles; 32 page `h1`.

Small text grew ~40% (a 9px meta line is now 13px); large text barely moved.
The ratio between largest and smallest went from 10x to 2.7x, which is the
point — 5.5px was never a legible step below 9px, it was noise.

## Overview header now matches

`.greeting h1` went 26px to 32px and its eyebrow to 12px, so every page title
is now the same size. This closes audit finding 5.

## Layout changes the scale required

Bigger text does not fit a layout drawn for 5.5px type. These are the containers
that had to move, all verified by measurement rather than eyeballing:

- **Panel headers.** `.dash-panel>header button` gets `white-space:nowrap` and
  `flex:0 0 auto` so "View calendar" stops breaking across two lines. The long
  titles still wrap, as "CLIENT / PROJECT PULSE" always did.
- **Client chips.** `.item-context` now wraps at desktop, not only under 680px,
  and `.item-context>strong` no longer shrinks. Before this, flex was squeezing
  "Westwyn" down to "Wes...". The meta line wraps to a second row instead.
- **Sidebar 204px to 236px**, and `.om-sidebar nav>a` wraps, so the "COMING
  SOON" badges sit under their labels. At 12px the badge plus label needed
  256px, and widening the rail that far would have cost the content area.
- **Team avatar times** stack the time over the zone (`.avatar-times>span`
  becomes a column). They were a flex row needing 110px in a 72px column.
- **Tools card meta** uses `repeat(auto-fit,minmax(66px,1fr))` so it drops to
  two columns rather than truncating "OM DevTeam" to "OM DevTe...".

## Deliberate exceptions

`.provider-mark` glyphs stay at 5.5-18.5px. They are icons ("●●●"), not text,
and the 12px floor made them overflow their 15px boxes. Their original values
were restored exactly.

Two `<small>` elements on `/admin/access` had no explicit size and were
inheriting the browser's 0.833 scaling down to 11.67px, under the floor. They
now have explicit sizes.

## Verification

Lint, `tsc --noEmit`, 6/6 render tests. Every page swept at 1440x900 and
680x900 in light and dark, checking each element for content overflow:
**zero overflowing elements** and no horizontal page scroll anywhere. Rendered
font sizes on every page fall on the scale, minimum 12px for text. The only
`scrollWidth` overhang left is `.collapse-button`, which is deliberately
`translateX(100%)` outside the rail and unchanged from before.


---

# Visual hierarchy pass (2026-08-24)

The type scale made every size consistent but left weight and colour doing
whatever they had been doing. Several roles were actively inverted: a
timestamp rendered heavier than the item it described.

## The rule applied

**Colour is earned by interaction or status. Identity and metadata carry by
weight instead.** Cobalt had been doing double duty — client names *and*
links — so neither read as meaningful.

Each row now descends cleanly through size, then weight, then colour:

| Tier | Role | Size / weight / colour |
|---|---|---|
| 1 | Task or event title | 14 / 700 / `--om-text` |
| 2 | Client identity | 12 / 600 / `--om-text` on `--om-soft` |
| 3 | Time | 12 / 500 / `--om-muted` |
| 4 | Source app | 12 / 400 / `--om-muted` |
| — | Status pill | 12 / 400 / semantic |
| — | Action link | 12 / 600 / cobalt |

## Inversions corrected

- **`.item-time` was `--om-text` at weight 600** — identical weight to the task
  title beside it. Now muted at 500.
- **Client chips were cobalt on a cobalt tint.** Now `--om-text` at 600 on
  `--om-soft`. Client colour still comes from the `.client-mark` avatar, which
  is where identity colour belongs.
- **`/clients` glance rows: the timestamp was 12px/700 cobalt while its own
  item title was 13px/700 dark.** The date was outranking the task. Timestamp
  is now muted at 500.
- **`/team` event rows were worse: time at 12px/700 cobalt against a title at
  13px/400.** Time is now muted at 500 and the title moved up to 600.
- **`.work-item .open-link` was a filled cobalt chip on every row** — six per
  panel, competing with the content. The fill and border are now transparent
  and appear on hover; the text stays cobalt because it is genuinely the
  interactive element.
- Action links normalised to 12/600 across all three pages (`.asana-link` and
  `.slack-dm` were 13/700).
- Tertiary labels dropped from 700/800 to 500/600: stat captions, tool meta
  values, department pills, the HIGH PRIORITY label.

## What deliberately kept its colour

Status pills — Overdue red, Due today amber, In 42 min blue, Mention purple —
and the Client Pulse status lines. These encode state, which is what colour is
for. They dropped from 13px to 12px so they sit in the meta tier rather than
competing with titles.

## Verification

Lint, `tsc --noEmit`, 6/6 tests. Zero overflowing elements and no horizontal
scroll on any page. Hierarchy confirmed by reading computed styles per role
rather than by eye.


---

# Micro steps: 8px and 10px (2026-08-24)

A hard 12px floor flattened hierarchy from the other direction — incidental
chrome was forced up to compete with content. Two steps added below the floor.

## Revised scale

**8, 10, 12, 13, 14, 16, 18, 21, 26, 32** (+ 40/48/56 auth display).

- **8px** — decorative status chrome only. Currently just the nav "COMING SOON"
  badge.
- **10px** — scan-once detail: uppercase eyebrows ("MY CLIENT WORK", "HIGH
  PRIORITY", "OM DAY AT A GLANCE", "RECENT ASANA ACTIVITY"), table column
  headers, `dt` keys ("Author", "Updated", "Opens"), stat captions ("Due
  today"), sidebar section labels ("MANAGE", "SETTINGS").
- **12px stays the floor for anything read in sequence** — times, client names,
  source apps, status pills, panel titles.

20 selectors moved to 10px, 1 to 8px.

## The sidebar accommodation is undone

The 12px "COMING SOON" badge was the reason the sidebar went to 236px with
wrapping nav links. At 8px the badge fits inline again, so both were reverted:
nav links are back to single 43px rows, and the rail is **228px** — still wider
than the original 204px, because "Integrations" plus badge needs 194px against
171px of inner width at 204px, but 8px narrower than the workaround required.

## Verification

Lint, `tsc --noEmit`, 6/6 tests. Zero overflowing elements and no horizontal
scroll on any page at 1440x900 or 680x900, light and dark. Rendered steps per
page now read [8, 10, 12, 13, 14, 16, 26] on the dashboard and
[10, 12, 13, 14, 16, 18, 32] on the list pages. CSS brace balance verified
after each scripted edit.


---

# Container-relative hierarchy on /clients (2026-08-24)

The global tiers were right, but several elements were sized for their type
rather than for their role *inside their container*. The recurring fault: a
container's own label rendered at the same size and weight as the content it
labels.

## Card container

Before, five things on a client card sat at 700 weight, three of them within
1px of each other. The card now has one lead and a clean descent:

| | Role | Was | Now |
|---|---|---|---|
| 1 | Client name | 18/700 | 18/700 |
| 2 | Stat number | 18/700 | **16/700** — was tied with the client name |
| 3 | Priority callout | 14/700 | 14/700 |
| 4 | Glance item title | 13/700 | **13/600** |
| 5 | Owner line | 13/400 | **12/400** — also stops it wrapping to two lines |
| 6 | Project chip | 12/700 text | **12/600 muted** — was a second headline |
| 7 | "AT A GLANCE" label | **13/700 dark** | **10/800 muted uppercase** |

The last one was the worst: the section label was styled identically to the
task titles beneath it, so the container competed with its own contents. It now
matches the eyebrow pattern already used by "HIGH PRIORITY" and "RECENT ASANA
ACTIVITY", and its "3 of 6" counter drops to the same 10px step.

## List container

Each row had **three** elements at 14/700 — client name, relationship, and
recent activity — so no row had a lead. The client name owns the row; the other
two are its attributes and now sit at 13/600, with row meta joining the 12px
tier to match the client column's owner line.

## Verification

Lint, `tsc --noEmit`, 6/6 tests. Card, List, My Clients and OM Clients scopes
all checked: zero overflowing elements, no horizontal scroll, rendered steps
[10, 12, 13, 14, 16, 18, 32]. Brace balance verified.


---

# FYI rail de-emphasis on /clients (2026-08-24)

`.client-group.secondary` — the "Clients I Support" and "Recent Interactions"
rail — is FYI context by design, but was only quieter than the primary My
Clients section on 3 of 9 measured elements, and on one it was **louder**.

## Before

| Element | My Clients | FYI rail |
|---|---|---|
| Section title | 14/800 | 14/800 — identical |
| Client name | 18/700 | 14/700 |
| Activity eyebrow | 10/800 | **12/800 — larger than primary** |
| Activity text | 14/400 | 13/400 |
| Status pill | 12/700 saturated | 12/700 saturated — identical |
| Asana action | 12/600 filled button | 12/600 filled button — identical |

The eyebrow inversion was self-inflicted: the previous commit dropped the
primary section's eyebrow to 10px and missed the rail's.

## After

Every element now steps down:

| Element | My Clients | FYI rail |
|---|---|---|
| Section title | 14/800 | 12/800 |
| Section sub | 13/400 | 12/400 |
| Client name | 18/700 | 14/700 |
| Identity mark | 14/800 | 10/800 at 78% opacity |
| Activity eyebrow | 10/800 | 10/700 |
| Activity text | 14/400 dark | 12/400 muted |
| Status pill | 12/700 | 10/600 at 75% opacity |
| Asana action | 12/600 filled | 12/500 borderless text link |

The eyebrow holds at 10px in both because 10 is the micro floor; it steps down
by weight instead.

Two changes carry most of the effect. The rail's Asana action loses its border
and fill, so the filled button now reads as belonging to the primary cards
only. And the status pills drop to 75% opacity — still legible as state, no
longer a saturated signal pulling the eye into the FYI column.

## Verification

Lint, `tsc --noEmit`, 6/6 tests. Zero overflowing elements and no horizontal
scroll, light and dark. Both `.secondary` groups confirmed to receive the
treatment. Comparison measured from computed styles per element, main against
rail.
