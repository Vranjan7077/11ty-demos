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

const items = await Promise.all(
    photos.map(async (photo) => {
        const metadata = await Image(photo.url, {
            widths: [400, 800],
            formats: ["webp", "jpeg"],
        });
        // ...generate HTML for each
    })
);

return { source: "pexels", items };
```

The `source` is `"placeholder"` instead when the fallback images were used, so the text above the gallery can say honestly where its pictures came from.

`@11ty/eleventy-img` accepts a remote URL exactly like a local file path — it downloads the source once, caches it, and generates the same resized/re-encoded output either way. Each photo ends up at two widths and two formats. The images are processed in parallel; eleventy-img already queues its own work internally, so six photos at once is safe.

The API call itself goes through `@11ty/eleventy-fetch` with a one-day cache, so rebuilding ten times in an afternoon asks Pexels once, and every build that day shows the same photos. The grid itself is plain CSS Grid with `auto-fill`, no JavaScript, no lightbox library.

## Folder Structure

```text
src/_11ty/pexels.js                       ← Pexels API call, cached for a day with eleventy-fetch
src/_11ty/gallery.js                      ← shared by this and Masonry Gallery: fetch, fall back, process
src/_data/imageGalleryDemo.js             ← this gallery's settings
src/_includes/demo-live/image-gallery.njk ← the grid markup
src/assets/scss/components/_gallery.scss  ← grid + masonry styles
```

## Important Files

{% codeFile "src/_data/imageGalleryDemo.js" %}

{% codeFile "src/_11ty/gallery.js" %}

{% codeFile "src/_11ty/pexels.js" %}

## Notes

- This needs a `PEXELS_API_KEY` environment variable (a free key from [pexels.com/api](https://www.pexels.com/api/)) — set it in `.env` locally and as a Netlify build environment variable for the deployed site. See `.env.example`.
- Without a key, or if the API is down, this falls back to a handful of generated placeholder gradients instead of failing the build, and logs one warning line saying why. A missing API key shouldn't be able to break every page that happens to show a gallery. The placeholders get alt text that says what they are, rather than pretending to be photos.
- `loading="lazy"` is on every image here since the grid always renders below the fold on this page. On a real gallery page, the first row or two visible on load should usually drop that attribute.
