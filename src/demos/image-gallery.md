---
title: "Image Gallery"
description: "A responsive image grid sourced from the Pexels API, processed at build time with @11ty/eleventy-img."
tags: ["images", "performance"]
date: 2026-07-22
difficulty: "Intermediate"
thumbnail: /assets/images/demos/image-gallery.svg
order: 102
demoBlock: "demo-live/image-gallery.njk"
---

## How It Works

The [Responsive Images](/demos/responsive-images/) and [Multi-format Images](/demos/multi-format-images/) demos both process one fixed local source image. A gallery needs real, varied photos instead, so this demo fetches six curated photos from the [Pexels API](https://www.pexels.com/api/) at build time and runs each one straight through `@11ty/eleventy-img`:

```js
const photos = await fetchPexelsPhotos("curated", 6);

for (const photo of photos) {
    const metadata = await Image(photo.url, {
        widths: [400, 800],
        formats: ["webp", "jpeg"],
    });
    // ...generate HTML for each
}
```

`@11ty/eleventy-img` accepts a remote URL exactly like a local file path — it downloads the source once, caches it, and generates the same resized/re-encoded output either way. Each photo ends up at two widths and two formats, computed once at build time and cached so a second build doesn't re-download or reprocess anything already fetched today. The grid itself is plain CSS Grid with `auto-fill`, no JavaScript, no lightbox library.

## Folder Structure

```text
src/_11ty/pexels.js                       ← shared Pexels fetch helper, used by this and Masonry Gallery
src/_data/imageGalleryDemo.js             ← fetches photos, processes each with eleventy-img
src/_includes/demo-live/image-gallery.njk ← the grid markup
src/assets/scss/components/_gallery.scss  ← grid + masonry styles
```

## Important Files

{% codeFile "src/_data/imageGalleryDemo.js" %}

## Notes

- This needs a `PEXELS_API_KEY` environment variable (a free key from [pexels.com/api](https://www.pexels.com/api/)) — set it in `.env` locally and as a Netlify build environment variable for the deployed site. See `.env.example`.
- Without a key, this quietly falls back to a handful of generated placeholder images instead of failing the build — a missing API key shouldn't be able to break every page that happens to show a gallery.
- `loading="lazy"` is on every image here since the grid always renders below the fold on this page. On a real gallery page, the first row or two visible on load should usually drop that attribute.
