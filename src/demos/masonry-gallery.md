---
title: "Masonry Gallery"
description: "A Pinterest-style masonry layout using plain CSS multi-column layout — no JavaScript, no masonry library."
tags: ["images", "css"]
date: 2026-07-22
difficulty: "Beginner"
thumbnail: /assets/images/demos/masonry-gallery.svg
order: 103
demoBlock: "demo-live/masonry-gallery.njk"
---

## How It Works

The [Image Gallery](/demos/image-gallery/) demo crops every image to the same 4:3 box with `object-fit: cover`, so a regular grid works. Masonry is the opposite idea: let each image keep its real height, and pack them into columns so there's no wasted space between short and tall images sitting side by side.

The whole layout is three CSS properties, no JavaScript:

```css
.masonry-gallery {
    columns: 3 180px;
    column-gap: 1rem;
}

.masonry-gallery__item {
    break-inside: avoid;
}
```

`columns` splits the container into however many columns fit at a minimum of 180px each, and flows child elements down one column before starting the next — which is exactly what creates the staggered look. `break-inside: avoid` is the one property that matters most: without it, a browser will happily slice a single image in half across two columns when a column break falls in the middle of it.

The photos themselves come from the same [Pexels API](https://www.pexels.com/api/) helper as the [Image Gallery](/demos/image-gallery/) demo, searched with `orientation=portrait` instead of the curated feed — real portrait photos naturally vary in height once resized to a fixed column width, which is exactly what makes the masonry effect visible. Unlike the grid demo, nothing here forces an `aspect-ratio` on the images; their real proportions are the point.

## Folder Structure

```text
src/_11ty/pexels.js                         ← shared Pexels fetch helper
src/_data/masonryGalleryDemo.js             ← fetches portrait photos, processes each with eleventy-img
src/_includes/demo-live/masonry-gallery.njk ← the layout markup
src/assets/scss/components/_gallery.scss    ← shared with the Image Gallery demo
```

## Important Files

{% codeFile "src/_includes/demo-live/masonry-gallery.njk" %}

## Notes

- CSS actually has a real `grid-template-rows: masonry` property in the spec, but as of this writing it's still Firefox-only behind a flag — `columns` is the version that works everywhere today.
- The one downside of `columns` versus a real masonry algorithm: it fills top-to-bottom, left-to-right, not by "shortest column first," so the columns can end up visibly uneven in total height. For six images that's barely noticeable; it gets more obvious with a lot more items.
- Same `PEXELS_API_KEY` requirement and placeholder-image fallback as the Image Gallery demo — see its Notes for details.
