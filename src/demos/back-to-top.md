---
title: "Back to Top"
description: "A back-to-top button that only appears on long pages, scrolls smoothly unless you prefer reduced motion, and moves keyboard focus back up too."
tags: ["javascript", "accessibility"]
date: 2026-10-24
difficulty: "Beginner"
thumbnail: /assets/images/demos/back-to-top.svg
order: 117
demoBlock: "demo-live/back-to-top.njk"
---

## How It Works

Every page on this site has the same link just before the footer, hidden until it's useful:

```html
<a class="back-to-top" href="#main" data-back-to-top hidden>↑ Back to top</a>
```

It's a real link to `#main`, the same target the skip link uses, rather than a `<button>` with a click handler and nowhere to go.

**When it shows up.** A small script watches scrolling (at most once per animation frame) and removes `hidden` once you're more than one and a half screens down. Short pages never show it at all, and because it uses the `hidden` attribute rather than just fading out, it isn't a stray Tab stop while it's invisible.

**What clicking does.** It does two things, and most back-to-top buttons forget the second:

1. It scrolls to the top, smoothly, or instantly if you've asked for reduced motion.
2. It moves keyboard focus to `<main>`. A button that only scrolls leaves focus at the bottom of the page, so the next press of <kbd>Tab</kbd> jumps you straight back down to the footer. Moving focus means the next Tab lands on the first link in the content, and screen readers start reading from the top.

```js
link.addEventListener("click", (event) => {
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    main.focus({ preventScroll: true });
});
```

`<main>` can take focus because it has `tabindex="-1"`, which it already needed for the skip link. `preventScroll: true` stops the focus call from cutting the smooth scroll short.

## Folder Structure

```text
src/assets/js/back-to-top.js             ← show after 1.5 screens, scroll + move focus
src/_includes/layouts/base.njk           ← the link, on every page
src/assets/scss/components/_reading.scss ← fixed in the corner
src/assets/scss/base/_print.scss         ← hidden on paper
```

## Important Files

{% codeFile "src/assets/js/back-to-top.js" %}

## Notes

- `event.preventDefault()` keeps `#main` out of the address bar, so sharing or reloading the page doesn't land someone halfway down at the content anchor.
- Without JavaScript the link stays hidden, since nothing would ever reveal it. The skip link and the <kbd>Home</kbd> key still work.
- It pairs with {% demoLink "resume-reading", "Resume Reading" %}, which takes you the other way: back down to where you stopped.
