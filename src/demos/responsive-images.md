---
title: "Responsive Images"
description: "Generating multiple image sizes and formats at build time with @11ty/eleventy-img."
tags: ["images", "performance"]
date: 2026-02-27
difficulty: "Intermediate"
thumbnail: /assets/images/demos/responsive-images.svg
order: 93
demoBlock: "demo-live/responsive-images.njk"
---

## How It Works

Shipping one giant image to every visitor, phone and desktop alike, wastes bandwidth. `@11ty/eleventy-img` fixes that at build time: give it one source file and a list of widths, and it generates a real image at each size (WebP here), plus the markup to let the browser pick the right one.

```js
const metadata = await Image(src, {
    widths: [400, 800, 1200],
    formats: ["webp"],
    outputDir: "public/assets/images/optimized/",
    urlPath: "/assets/images/optimized/",
});

return Image.generateHTML(metadata, { alt, sizes, loading: "lazy", decoding: "async" });
```

That produces a real `<img>` with a `srcset` listing every generated width, plus a `sizes` attribute telling the browser how big the image will actually be shown at different viewport widths. The browser does the picking, not your CSS.

Most demo pages can drop in a responsive image with one shortcode call: `{% raw %}{% image "path/to/source.jpg", "alt text", "sizes" %}{% endraw %}`. The image above on this page is built the same way, just precomputed once through global data (`src/_data/responsiveImageDemo.js`) instead of called inline, since it only ever needs to run for this one source file.

## Folder Structure

```text
src/_11ty/shortcodes/image.js       ← the reusable image shortcode
src/_data/responsiveImageDemo.js     ← precomputed HTML for the image above
src/_includes/demo-live/responsive-images.njk ← usage
```

## Important Files

{% codeFile "src/_11ty/shortcodes/image.js" %}

## Notes

- Alt text is required. The shortcode throws a build error if you forget it, on purpose, since a missing `alt` is easy to miss in review but obvious to a screen reader user.
- `loading="lazy"` and `decoding="async"` are set by default, so images below the fold don't block the initial page render.
- Eleventy caches generated images between builds, so re-running `npm run build` without touching the source image doesn't reprocess it every time.
- This demo only varies the **size** served. The [Multi-format Images demo](/demos/multi-format-images/) covers the other axis: serving AVIF, WebP, and JPEG from the same `<picture>` and letting the browser pick the format it supports.
