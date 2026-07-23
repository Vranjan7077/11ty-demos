---
title: "Print Stylesheet"
description: "A real @media print stylesheet, loaded site-wide — strips chrome, forces light mode, and prints link URLs."
tags: ["css", "accessibility"]
date: 2026-07-22
difficulty: "Beginner"
thumbnail: /assets/images/demos/print-stylesheet.svg
order: 104
demoBlock: "demo-live/print-stylesheet.njk"
---

## How It Works

Everything lives in one `@media print` block, loaded on every page, not just this one. Three things it does:

**Strips the chrome.** The header, footer, breadcrumbs, and Prev/Next links exist to help someone navigate a website — none of that means anything once the page is on paper, so they're hidden outright:

```css
.site-header,
.site-footer,
.breadcrumbs,
.pagination-nav {
    display: none !important;
}
```

**Forces light mode, regardless of the real toggle.** This site's dark mode sets colors through `:root[data-theme="dark"]` — a fairly specific selector. To reliably win against it during print, the print rule targets that exact same selector (plus `:root[data-theme="light"]`, plus the bare `:root`) inside `@media print`, so it always wins no matter which theme is active when someone hits print:

```css
@media print {
    :root,
    :root[data-theme="dark"],
    :root[data-theme="light"] {
        --color-bg: #ffffff;
        --color-fg: #000000;
    }
}
```

**Prints link destinations.** A link is only clickable on a screen. On paper, `<a href="...">` text alone loses the URL entirely — so external links get it appended in parentheses automatically:

```css
a[href^="http"]:not([href*="11ty-demos.netlify.app"])::after {
    content: " (" attr(href) ")";
}
```

## Folder Structure

```text
src/assets/scss/base/_print.scss ← the whole stylesheet
src/assets/scss/main.scss        ← registers it, right after base/theme
```

## Important Files

{% codeFile "src/assets/scss/base/_print.scss" %}

## Notes

- Hard drop-shadows (`--shadow-hard`) are set to `none` for print, but borders stay — a shadow is a screen-only affordance, while a border is still doing real work separating one block from another on a printed page.
- `break-inside: avoid` on cards, code blocks, and images stops a browser from slicing one of them in half across a page break — a small detail, but the difference between "readable" and "a code block with the punchline on the next sheet."
- There's no automated test for this. The honest way to check a print stylesheet is still Print Preview in a real browser, which is exactly what the Live Implementation above asks you to do on this page itself.
