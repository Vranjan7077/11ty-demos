---
title: "Search"
description: "A hand-rolled, dependency-free client-side search: a build-time JSON index plus a small scored-match script."
tags: ["javascript", "data", "performance"]
date: 2026-01-25
difficulty: "Advanced"
thumbnail: /assets/images/demos/search.svg
order: 60
demoBlock: "demo-live/search.njk"
eleventyNavigation:
    key: Search
    parent: Demos
    order: 4
---

## How It Works

Search here has two halves, and both are plain to read, no external search service or WASM binary involved:

1. **Build time.** `search-index.njk` loops over `collections.demos` and `collections.posts` and turns each item into a small object: `{ title, url, description, tags }`. Eleventy writes that out as static JSON at `/search-index.json`, fresh on every build.
2. **Runtime.** `search.js` fetches that JSON the first time you type (one shared request, even with two search boxes on the page or fast typing), then scores every entry on each keystroke by counting how many of your search words show up in its title, description, or tags (title matches count for more). It sorts by score and drops the top results into a list under the input.

The results are built with `textContent`, never `innerHTML`, so a title containing `<` or `&` shows up as text. A visually hidden `role="status"` region announces "5 results" to screen readers, the down arrow moves into the results, up/down move between them, and Escape closes the list. If the index can't be fetched, the list says so instead of failing silently.

This is progressive enhancement. The input works fine with JavaScript off, you just get a plain text field. With it on, you get instant results with no network request per keystroke, since the whole index is already sitting in memory.

## Folder Structure

```text
src/search-index.njk                       ← outputs /search-index.json
src/assets/js/search.js                     ← fetch + scored match + render
src/_includes/components/search-bar.njk     ← the <input> + results list
```

## Important Files

{% codeFile "src/search-index.njk" %}

{% codeFile "src/assets/js/search.js" %}

## Notes

- No dependencies here: no Lunr, Fuse.js, Pagefind, or server, just `fetch` and array scoring.
- The index only holds title/description/tags, not full page text, to keep the JSON small. At a much bigger scale you'd want a real inverted index, which is exactly what the [Pagefind demo](/demos/pagefind-search/) covers.
- The index gets rebuilt every time, so it can never go stale.
