---
title: "Generated Social Images"
description: "Every page gets its own 1200×630 share card, drawn at build time from its title, description, and thumbnail."
tags: ["images", "content", "performance"]
date: 2026-10-24
difficulty: "Advanced"
thumbnail: /assets/images/demos/social-images.svg
order: 115
demoBlock: "demo-live/social-images.njk"
---

## How It Works

When someone shares a link, LinkedIn, X, Slack, and Discord all show the image named in the page's `og:image` meta tag. One generic image for every page makes every share look the same. This site draws a separate card for each page while it builds, based on the card generator from [vranjan.dev](https://vranjan.dev/).

The card is an SVG string built in plain JavaScript: a white card with a thick border and a hard shadow on the site's blue, an eyebrow ("Beginner demo", "Blog post"), the title, the description, and for demos, the demo's own thumbnail on the right. [resvg](https://github.com/yisibl/resvg-js) then turns that SVG into a PNG:

```js
new Resvg(svg, {
    font: { fontFiles: [hankenRegular, hankenSemiBold], loadSystemFonts: false },
})
    .render()
    .asPng();
```

`loadSystemFonts: false` matters. resvg draws text with exactly the font files it's given, so a card built on Netlify's Linux servers looks identical to one built on a Windows laptop. Tools that rely on installed system fonts quietly fall back to something else on a server that doesn't have yours.

### Wrapping text without a browser

SVG has no automatic line wrapping, so the generator measures it. It asks resvg for the bounding box of each candidate line, adds words until the next one would overflow, and limits the title to three lines and the description to two or three. Anything longer is cut at a word boundary and ends with an ellipsis, like the description in the card above. Measurements are cached, since the same words come up on many pages.

### Fast rebuilds

Rendering a card takes a few dozen milliseconds, and there are about 60 of them. So each card is named after a hash of everything that affects how it looks: the title, description, eyebrow, the thumbnail's SVG, the fonts, and the generator's own code. Finished PNGs are kept in `.cache/og-images/`. On the next build, any card whose hash already exists is copied instead of redrawn, so only pages whose text actually changed cost anything.

The same hash goes in the public filename, `/assets/images/og/<hash>.png`, so those files are cached for a year as `immutable`, the same way the {% demoLink "cache-busting", "Cache Busting" %} demo treats CSS and JS. Change a title and the page points at a new file.

### Wiring it into every page

The base layout calls the generator as an async shortcode, so every page gets a card with no extra front matter:

{% raw %}

```njk
<meta property="og:image" content="{{ site.url }}{% ogImage ogTitle or title or site.title, description or site.description, ogEyebrow, thumbnail %}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

{% endraw %}

A page can override the card's title or eyebrow with `ogTitle` and `ogEyebrow` in its front matter. The home page uses that so its card says "Real 11ty examples, not tutorials." instead of the site name three times.

## Folder Structure

```text
src/_11ty/og-images/generate.js     ← the SVG template, text measuring and wrapping, PNG rendering
src/_11ty/og-images/fonts/          ← Hanken Grotesk Regular + SemiBold (TTF, OFL)
src/_11ty/shortcodes/ogImage.js     ← hashing, the .cache copy, writing into public/
src/_includes/layouts/base.njk      ← og:image and twitter:image on every page
netlify.toml                        ← immutable caching for /assets/images/og/*
```

## Important Files

{% codeFile "src/_11ty/shortcodes/ogImage.js" %}

{% codeFile "src/_11ty/og-images/generate.js" %}

## Notes

- Share previews are cached by each platform. After changing a card, [LinkedIn's Post Inspector](https://www.linkedin.com/post-inspector/) and similar tools can force a refresh; otherwise old previews can stick around for days.
- Netlify starts each build with a clean `.cache/` folder, so a production build draws every card again, which adds a few seconds. The cache mainly speeds up local builds and `npm start`.
- The build smoke tests open every page's card and check that it exists and really is a 1200×630 PNG.
- resvg's last release was in 2024. It's stable and widely used, but if it ever stops installing, Satori or a headless browser can produce the same PNGs from the same SVG.
