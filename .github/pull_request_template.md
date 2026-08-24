## What this changes

<!-- One or two sentences. What does a reviewer need to know before reading the diff? -->

## Why

<!-- Link the issue, or explain the motivation if there isn't one. -->

Closes #

## How to verify

<!-- The steps you actually ran. Include the route or page if this touches UI. -->

1.
2.

## Checklist

- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes
- [ ] Checked in **both light and dark mode** if this touches UI
- [ ] Checked at **1440px and 680px** if this touches layout
- [ ] No new CSS class or design token unless the PR explains why an existing one
      would not do — see `docs/UI-CONSISTENCY-AUDIT.md`
- [ ] No secrets, tokens, or real client data in the diff

## Screenshots

<!-- Before / after for UI changes. Delete this section if not applicable. -->
