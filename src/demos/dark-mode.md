---
title: "Dark Mode"
description: "A flicker-free light/dark theme toggle built on CSS custom properties, a data-theme attribute, and localStorage."
tags: ["css", "javascript", "accessibility"]
date: 2026-01-10
difficulty: "Beginner"
thumbnail: /assets/images/demos/dark-mode.svg
order: 10
demoBlock: "demo-live/dark-mode.njk"
eleventyNavigation:
    key: Dark Mode
    parent: Demos
    order: 1
---

## How It Works

Every color on this site is a CSS variable, defined once for light and once for dark, switched by a `data-theme` attribute on `<html>`:

```css
:root {
    --color-bg: #fff;
    --color-fg: #10131a;
}
@media (prefers-color-scheme: dark) {
    :root {
        --color-bg: #0b0d12;
        --color-fg: #e7e9ee;
    }
}
[data-theme="dark"] {
    --color-bg: #0b0d12;
    --color-fg: #e7e9ee;
}
[data-theme="light"] {
    --color-bg: #fff;
    --color-fg: #10131a;
}
```

Switching themes is just flipping that one attribute. No stylesheet swap, no re-render.

A small script sits in `<head>`, before any CSS paints. It reads your saved preference from `localStorage`, or falls back to your OS setting, and sets `data-theme` right away. That's the whole trick for avoiding the "flash of wrong theme" you see on a lot of sites.

Clicking the toggle button runs a handler in `main.js` that flips the attribute and saves your choice to `localStorage`, so it sticks around next time you visit.

## Folder Structure

```text
src/
  _includes/
    layouts/base.njk               ← inline anti-FOUC script
    components/theme-toggle.njk    ← the button + icons
  assets/
    scss/base/_theme.scss          ← the two token sets
    js/main.js                     ← click handler + persistence
```

## Important Files

{% codeFile "src/_includes/components/theme-toggle.njk" %}

{% codeFile "src/assets/js/main.js" %}

## Notes

- Follows your OS setting until you pick a theme yourself, then remembers that instead.
- The toggle is a real `<button>`, not a checkbox dressed up to look like one, so screen readers announce it correctly with `aria-label`.
- Since it's all CSS variables, adding a third theme (like "high contrast") is just another `[data-theme="..."]` block.
