---
title: "Data Files"
description: "Eleventy's global _data files, explained using this site's own real data files as the example."
tags: ["data"]
date: 2026-07-22
difficulty: "Beginner"
thumbnail: /assets/images/demos/data-files.svg
order: 99
demoBlock: "demo-live/data-files.njk"
---

## How It Works

Any file dropped into `src/_data/` becomes available in every template on the site, under a key that matches the filename. `site.js` exports a plain object, so `site.title`, `site.author`, and `site.year` are just there — no registration, no import, nothing to wire up:

```js
export default {
    title: "11ty Demos",
    author: { name: "Vinay Ranjan", url: "https://vranjan.dev/" },
    year: new Date().getFullYear(),
};
```

That's the whole file. This site has been using it since the very first page — it's what sets the `<title>` tag, the footer copyright year, and the author link, on every single page.

A data file doesn't have to be a static object, either — it can export an `async function` instead, and Eleventy will await it once per build and cache the result. Half the "live" demos on this site are actually just data files doing real async work at build time: `lighthouse.js` reads a committed JSON file, and `imageGalleryDemo.js` fetches real photos from an API and processes them with `@11ty/eleventy-img`. Same mechanism, same filename-to-key rule, just returning a promise instead of an object.

## Folder Structure

```text
src/_data/site.js                 ← the plain-object example on this page
src/_data/lighthouse.js           ← async example: reads a JSON file
src/_data/imageGalleryDemo.js     ← async example: fetches + processes images
src/_includes/demo-live/data-files.njk ← this page's live values
```

## Important Files

{% codeFile "src/_data/site.js" %}

The whole `site` object is also dumped as real JSON below, using a small `toJson` filter (`JSON.stringify(value, null, 2)` in one line) — see {% demoLink "custom-filters", "Custom Filters" %} for more on how filters like that get registered.

## Notes

- The filename is the only thing that decides the data's key — `site.js` becomes `site`, `lighthouse.js` becomes `lighthouse`. Rename the file and every template referencing the old name breaks, on purpose — there's no separate registration step to forget to update.
- Data files merge the same way front matter does: a file closer to the template (directory data, then front matter) can override a value from a more global one. `src/_data/` sits at the very top of that cascade, which is why it's the right place for things every page needs, like `site.title`.
