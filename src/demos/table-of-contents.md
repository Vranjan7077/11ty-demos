---
title: "Table of Contents"
description: "A heading-extraction filter that builds a page's table of contents from its own rendered HTML — no separate outline to maintain."
tags: ["content", "accessibility", "javascript"]
date: 2026-01-20
difficulty: "Intermediate"
thumbnail: /assets/images/demos/table-of-contents.svg
order: 50
demoBlock: "demo-live/table-of-contents.njk"
---

## How It Works

`markdown-it-anchor` is set up in `eleventy.config.js` to add an `id` to every `h2`–`h4` in rendered Markdown, based on the heading text. That alone makes every heading deep-linkable, like `#folder-structure`.

A custom `toc` filter then takes a page's already-rendered HTML and runs one regex over it, pulling out `{ level, id, text }` for each `h2`/`h3` in the order they appear. There's no separate list to keep in sync anywhere. The table of contents can't drift from the real headings because it's built from them.

The Live Implementation panel above is running that exact filter against this page's own content right now. Every entry it lists is a real heading on this page, and clicking one jumps straight to that section.

## Folder Structure

```text
src/_11ty/filters/toc.js                     ← toc()
src/assets/js/toc.js                          ← optional scroll-spy highlight
src/_includes/demo-live/table-of-contents.njk ← usage
```

## Important Files

{% codeFile "src/_11ty/filters/toc.js" %}

{% codeFile "src/assets/js/toc.js" %}

## Notes

- You need at least two `h2`/`h3` headings on a page for this to show anything.
- Only `h2` and `h3` show up by default. `h4` is skipped on purpose to keep the outline from getting cluttered; tweak the regex in `toc()` if you want it back.
- The scroll-spy script is optional. The list of links works fine without it.
