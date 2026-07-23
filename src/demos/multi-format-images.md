---
title: "Multi-format Images"
description: "Letting the browser pick between AVIF, WebP, and JPEG with a single <picture> element."
tags: ["images", "performance"]
date: 2026-03-01
difficulty: "Intermediate"
thumbnail: /assets/images/demos/multi-format-images.svg
order: 95
demoBlock: "demo-live/multi-format-images.njk"
---

## How It Works

The [Responsive Images demo](/demos/responsive-images/) covers serving different **sizes** of the same file. This one covers a different axis: different **formats**. AVIF is smaller than WebP, which is usually smaller than JPEG, but browser support still varies, so you don't want to just serve AVIF and hope.

Ask `@11ty/eleventy-img` for more than one format and it stops generating a plain `<img>` and gives you a real `<picture>` element instead:

```js
const metadata = await Image(src, {
    widths: [400, 800, 1200],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "public/assets/images/optimized/",
    urlPath: "/assets/images/optimized/",
});

return Image.generateHTML(metadata, { alt, sizes, loading: "lazy", decoding: "async" });
```

That produces one `<source>` per format, each with its own `srcset` of widths, in the order listed, plus a plain `<img>` as the final fallback. The browser walks the `<source>` list top to bottom and uses the first format it actually supports, so a browser that understands AVIF never even requests the WebP or JPEG versions.

The source image here is a small gradient generated specifically for this demo (there's no royalty-free photo bundled with the repo), which is enough to actually show a size difference between formats. A flat-color icon compresses about the same in every format, so it wouldn't prove much.

## Folder Structure

```text
src/_data/multiFormatImageDemo.js  ← calls Image() with three formats
src/assets/images/demos/gradient-source.jpg
src/_includes/demo-live/multi-format-images.njk
```

## Important Files

{% codeFile "src/_data/multiFormatImageDemo.js" %}

## Notes

- Format order in the `formats` array matters. List your most-preferred (usually AVIF) first, since that's the one capable browsers will pick.
- Just like the other Responsive Images demo, this is precomputed once through global data rather than called inline, since it only ever needs to process this one source file.
- AVIF encoding is noticeably slower than WebP or JPEG at build time. On a site with hundreds of images, that's worth knowing before you turn it on for everything.
