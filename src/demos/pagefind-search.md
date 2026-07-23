---
title: "Pagefind Search"
description: "Full-text search across the whole site, built by indexing the actual HTML after the build finishes."
tags: ["javascript", "data", "performance"]
date: 2026-02-28
difficulty: "Intermediate"
thumbnail: /assets/images/demos/pagefind-search.svg
order: 94
demoBlock: "demo-live/pagefind-search.njk"
---

## How It Works

The [Search demo](/demos/search/) on this site is a small hand-rolled index of titles, descriptions, and tags. It's fast and dependency-free, but it doesn't look inside the actual body text of a page. Pagefind takes a completely different approach: it runs **after** the site is built, crawls every generated HTML file, and indexes the real page content, headings and paragraphs included.

```json
"scripts": {
  "build": "npm run clean && eleventy && npm run build:pagefind",
  "build:pagefind": "pagefind --site public"
}
```

That's the whole setup. `pagefind --site public` walks the built `public/` folder, builds a compact search index out of it, and drops the index plus a ready-made search widget into `public/pagefind/`. The box above is that exact widget, `PagefindUI`, pointed at a container div, with a few CSS variables overridden to match this site's look.

## Folder Structure

```text
package.json                                     ← build:pagefind script
src/_includes/demo-live/pagefind-search.njk       ← the widget
src/assets/scss/components/_pagefind.scss         ← theme variable overrides
public/pagefind/                                  ← generated at build time, not source-controlled
```

## Important Files

{% codeFile "src/_includes/demo-live/pagefind-search.njk" %}

## Notes

- Pagefind indexes the **built output**, not your source files, so it only knows about content that's actually made it into a finished HTML page.
- The index only exists after a full `npm run build`. Running `npm start` on a totally fresh checkout won't show results here until you've built at least once, since the dev server doesn't run the indexing step on its own.
- This and the hand-rolled Search demo aren't competing with each other so much as showing two ends of the same tradeoff: build your own tiny index for speed and control, or reach for a real search engine like Pagefind once your content gets too big for that to make sense.
