---
title: "Accessibility"
description: "Three real accessibility techniques already running on this site: a skip link, visually-hidden text, and a genuine bug this site had and fixed."
tags: ["accessibility", "css"]
date: 2026-07-22
difficulty: "Intermediate"
thumbnail: /assets/images/demos/accessibility.svg
order: 106
demoBlock: "demo-live/accessibility.njk"
---

## How It Works

**The skip link.** A keyboard or screen-reader user who lands on any page here has to tab past the header, logo, nav, search, and theme toggle before reaching the actual content — unless they use the skip link. It's a real link, first in the DOM, hidden off-screen until it receives focus:

```scss
.skip-link {
    position: absolute;
    top: -3rem;
    left: var(--space-sm);
    transition: top 0.15s ease;

    &:focus {
        top: var(--space-sm);
    }
}
```

Not `display: none` — a link that's `display: none` can never receive focus in the first place, which would make it useless for the exact people it's meant to help. Moving it off-screen with `position: absolute` keeps it perfectly keyboard-reachable while invisible to everyone else, until Tab brings it into view.

**Visually-hidden text.** Some controls need an accessible name that a sighted mouse user doesn't need to see — the mobile nav toggle is a hamburger icon, not the word "Menu", but a screen reader still needs to announce something. A small mixin handles it:

```scss
@mixin visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

This is deliberately not `display: none` either, for the same reason — screen readers skip content that's `display: none`, but this technique shrinks an element to a single invisible pixel while keeping it fully readable by assistive tech.

## A real bug this site had

The {% demoLink "custom-filters", "demo cards" %} used to wrap their thumbnail image in a link with both `aria-hidden="true"` and `tabindex="-1"`, meant to hide a purely decorative duplicate link from screen readers:

```html
<a class="demo-card__thumb-link" href="..." tabindex="-1" aria-hidden="true">
    <img ... alt="" />
</a>
```

`tabindex="-1"` only removes an element from the _keyboard_ Tab order — it doesn't stop a mouse click from focusing it. Clicking a thumbnail focused a link that was simultaneously hidden from assistive technology, which is exactly the failure Chrome's DevTools flags: focus must never end up somewhere `aria-hidden` says isn't there.

The fix wasn't a smaller patch — it was removing the fake link entirely. The thumbnail is now a plain, non-interactive `<div>`, and the real, already-accessible title link stretches over the whole card with a positioned `::after` pseudo-element, so clicking anywhere (including the thumbnail) still navigates, through one real link instead of two:

```css
.demo-card__title a::after {
    content: "";
    position: absolute;
    inset: 0;
}
```

## Folder Structure

```text
src/assets/scss/layout/_grid.scss      ← .skip-link
src/assets/scss/abstracts/_mixins.scss ← visually-hidden mixin
src/assets/scss/components/_card.scss  ← the stretched-link fix
```

## Important Files

{% codeFile "src/assets/scss/layout/_grid.scss", 24, 39 %}

{% codeFile "src/assets/scss/abstracts/_mixins.scss", 14, 24 %}

## Notes

- Colors on this site were never eyeballed. Every text/background pairing — including the three grade colors on the {% demoLink "lighthouse-scores", "Lighthouse Scores" %} demo — was checked against the real WCAG contrast formula (relative luminance, not just "does it look readable") before shipping. One of them failed on the first try and had to be darkened.
- Neither the skip link nor the stretched card link needed any JavaScript. Both are pure CSS, which also means they can't break if a script fails to load.
