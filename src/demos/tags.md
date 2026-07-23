---
title: "Tags"
description: "Auto-generated tag pages built from a custom collection — every demo tag gets its own page with zero manual wiring."
tags: ["collections", "data"]
date: 2026-01-15
difficulty: "Beginner"
thumbnail: /assets/images/demos/tags.svg
order: 30
demoBlock: "demo-live/tags.njk"
eleventyNavigation:
    key: Tags
    parent: Demos
    order: 3
---

## How It Works

Every demo's front matter has a `tags` array, like `["css", "javascript"]`. A directory data file (`src/demos/demos.json`) also stamps a structural `"demo"` tag onto every file in that folder, and Eleventy merges those two arrays together, so a demo's final tag list ends up as `["demo", ...whatever you wrote]`.

A custom collection called `demoTags` walks every demo, pulls out the non-structural tags into a `Set` (which dedupes and sorts them for free), and hands back the list. One paginated template, `tags.njk`, then asks Eleventy to spit out one page per tag, landing at `/demos/tags/<tag>/`.

## Folder Structure

```text
src/_11ty/collections/demoTags.js ← builds the unique tag list
src/tags.njk                       ← paginated template, one output per tag
src/_includes/components/tag-list.njk
```

## Important Files

{% codeFile "src/_11ty/collections/demoTags.js" %}

{% codeFile "src/tags.njk" %}

## Notes

- Add a brand-new tag to any demo's front matter and its page just appears on the next build. Nothing else to touch.
- Tag pages reuse the same `demoCard` macro as the main `/demos/` listing, so they look consistent without any extra work.
