---
title: "Image Lightbox"
description: "Click a gallery photo to see it large, in an accessible lightbox built on the native dialog element instead of a library."
tags: ["images", "accessibility", "javascript"]
date: 2026-10-25
difficulty: "Intermediate"
thumbnail: /assets/images/demos/image-lightbox.svg
order: 121
demoBlock: "demo-live/image-lightbox.njk"
---

## How It Works

A lightbox is an overlay that shows one image large, on top of a dimmed page. Most lightbox libraries rebuild things the browser now does by itself, so this one is built on the native `<dialog>` element in about 80 lines.

### It starts as a link

Every photo in the gallery is a plain link to its largest version:

```html
<a href="/assets/images/optimized/abc-800.jpeg" data-lightbox-item data-full="/assets/images/optimized/abc-800.webp">
    <picture>…</picture>
</a>
```

Without JavaScript, clicking opens the full-size image, which is a perfectly good fallback. Ctrl-click, Cmd-click, and middle-click still open it in a new tab even with JavaScript on, because the script only takes over a plain left click.

### Then it becomes a dialog

With JavaScript on, a left click opens a `<dialog>` using `showModal()`, and that single call does most of the accessibility work for free. The rest of the page goes inert, so Tab can't wander off behind the photo and screen readers only see the dialog. Esc closes it without any key handling of my own. The dimmed background is the dialog's `::backdrop`, which is one line of CSS.

The script handles everything else: arrow keys and on-screen buttons to move between photos, a "3 of 6" counter that screen readers announce (`aria-live`), the photo's alt text shown as a caption, closing when you click outside the image, and putting focus back on the photo you opened, so keyboard users pick up where they left off.

The large image in the dialog uses the WebP version, since every browser that supports `<dialog>` also supports WebP. The link's `href` uses the JPEG, so the no-JavaScript fallback works in every browser.

## Folder Structure

```text
src/assets/js/lightbox.js                    ← the whole lightbox
src/_includes/components/lightbox-gallery.njk ← wraps each gallery item in its link
src/_11ty/gallery.js                          ← now also returns each photo's full-size URLs
src/assets/scss/components/_gallery.scss      ← dialog, backdrop, and button styles
```

## Important Files

{% codeFile "src/assets/js/lightbox.js" %}

{% codeFile "src/_includes/components/lightbox-gallery.njk" %}

## Notes

- The dialog is built by the script the first time a photo is opened, so pages without a gallery carry no extra markup.
- The full-size images are the ones the galleries already generate at build time, so the lightbox adds no extra image processing.
- The lightbox is hidden when printing, like the other overlays in the {% demoLink "print-stylesheet", "print stylesheet" %}.
