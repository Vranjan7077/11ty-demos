---
title: "Automatic Image Optimization"
description: "Write a plain img tag, get modern formats, several sizes, and width and height filled in, for every image on the site."
tags: ["images", "performance", "plugins"]
date: 2026-10-25
difficulty: "Beginner"
thumbnail: /assets/images/demos/automatic-images.svg
order: 120
demoBlock: "demo-live/automatic-images.njk"
---

## How It Works

The {% demoLink "responsive-images", "Responsive Images" %} demo calls `@11ty/eleventy-img` by hand for each picture. That's the right tool when a data file needs the image metadata, but most of the time you just want to write

```html
<img src="./images/home.png" alt="The home page" />
```

or `![The home page](./images/home.png)` in Markdown, and have it come out right. Eleventy-img ships a plugin for exactly that:

```js
eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    urlPath: "/assets/images/optimized/",
    formats: ["webp", "auto"],
    widths: [480, 960, 1600],
    svgShortCircuit: true,
    htmlOptions: {
        imgAttributes: { loading: "lazy", decoding: "async", sizes: "(min-width: 78rem) 72rem, calc(100vw - 3rem)" },
    },
});
```

Once a page has rendered, the plugin goes through its HTML, finds every `<img>`, and swaps it for a `<picture>`. Each image gets a WebP version, plus one in its original format (`auto`) for the odd browser that can't show WebP. It's made at 480, 960, and 1600px wide, but never wider than the original, and the `sizes` default tells the browser how wide it'll actually be on screen so it can download the smallest one that still looks sharp.

It also fills in `width` and `height` from the real file, so the browser can hold the right amount of space before the image arrives and the text doesn't jump around. And it adds `loading="lazy"` and `decoding="async"` unless the tag already says something different, which is why the first row of demo cards keeps its `loading="eager"`.

The source files never ship. The screenshots on this page live in `src/demos/images/`, outside the folders copied to the site, and only the converted versions end up in `public/`.

### SVGs and images that are already done

`svgShortCircuit: true` means an SVG goes in and the same SVG comes out. Every demo card thumbnail on this site now goes through the plugin this way: the SVG isn't converted, but it's copied to a content-hashed filename, so it can be cached for a year.

Images that were already processed, like the galleries' photos and the generated social cards, carry `eleventy:ignore`, which tells the plugin to leave that tag alone. The attribute is removed from the final HTML.

### Missing images stop the build

If an `<img>` points at a file that doesn't exist, the plugin fails the build with the path it couldn't find, instead of quietly publishing a broken image. Adding this demo proved it: the build stopped until this page's own thumbnail had been created.

## Folder Structure

```text
src/_11ty/imageTransformOptions.js    ← the options, shared by the plugin and the data file below
eleventy.config.js                    ← adds eleventyImageTransformPlugin
src/demos/images/                     ← source screenshots, never published as-is
src/_data/automaticImagesDemo.js      ← reads back the file sizes for the tables above
```

## Important Files

{% codeFile "src/_11ty/imageTransformOptions.js" %}

{% codeFile "src/_data/automaticImagesDemo.js" %}

## Notes

- The file-size tables are real: `automaticImagesDemo.js` asks eleventy-img for the same images with the same options, which returns the files the plugin writes, including their sizes. Because the options are shared, it can't show numbers for a different configuration than the one the site actually uses.
- AVIF is left out here, even though it's usually smaller still. Encoding large AVIF images is slow and would run on every Netlify build; the {% demoLink "multi-format-images", "Multi-format Images" %} demo shows it on one small image instead.
- During `npm start`, images are converted the first time a browser asks for them rather than up front, which keeps the dev server quick to start.
