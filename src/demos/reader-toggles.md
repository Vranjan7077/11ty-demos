---
title: "CSS and Web Font Toggles"
description: "Two switches that let a reader turn off the site's CSS or its web font, remembered across pages without a flash of the wrong state."
tags: ["css", "javascript", "accessibility", "performance"]
date: 2026-10-24
difficulty: "Intermediate"
thumbnail: /assets/images/demos/reader-toggles.svg
order: 112
demoBlock: "demo-live/reader-toggles.njk"
---

## How It Works

This pattern comes from the settings panel on [vranjan.dev](https://vranjan.dev/), which lets readers switch off the site's CSS and its web fonts. It's a small way of showing that the site is built on solid HTML underneath, and a practical one for anyone who just wants the text. Both switches here use the same three pieces.

**A real toggle button.** Each switch is a `<button>` with `aria-pressed`, not a checkbox styled to look like one. Its accessible name is its visible label ("CSS", "Web Fonts") and `aria-pressed` says whether that thing is on, so a screen reader announces "CSS, toggle button, pressed". The track and knob are a decorative `<span>` drawn entirely by the `[aria-pressed]` selectors, so the visual state can never disagree with what's announced.

**One stored object.** Both choices live in a single `localStorage` entry, and only the non-default values are saved:

```json
{ "css": false, "webFonts": false }
```

Turn both switches back on and the entry is removed entirely, so a reader who never changed anything has nothing stored at all.

**A tiny script in `<head>`.** Applying a saved choice after the page has rendered would flash the wrong state on every navigation: a fully styled page that suddenly goes plain, or one font swapping for another. So a few lines of inline script run in `<head>`, before anything paints, the same way the {% demoLink "dark-mode", "Dark Mode" %} demo applies the saved theme. There are two of them, on either side of the stylesheet `<link>`: the font one runs _before_ it, so it can start the font download as early as possible, and the CSS one runs _after_ it, because the `<link>` has to exist before it can be disabled.

### Turning off CSS

Every `<link rel="stylesheet">` and `<style>` element has a `disabled` property. Set it to `true` and the browser drops the whole stylesheet immediately; set it back to `false` and the styles return, no reload needed:

```js
document.querySelectorAll('link[rel="stylesheet"], style').forEach((sheet) => {
    if (!sheet.hasAttribute("data-permanent")) sheet.disabled = !enabled;
});
```

The `data-permanent` escape hatch is for any stylesheet that must survive. vranjan.dev uses it; this site has none yet. Stylesheets added further down the page (like the [Pagefind demo](/demos/pagefind-search/)'s widget styles) don't exist yet when the head script runs, so `main.js` applies the same state again once the page has loaded.

One thing matters more than the rest: you have to be able to turn CSS back on while it's off. That's why the switch sits in the footer of every page instead of only on this one. Without styles the footer is still at the bottom, and the switch is still just a button that says "CSS".

### Turning off web fonts

This site's body text uses Hanken Grotesk, a self-hosted variable font, with the system's own sans-serif as the fallback. Every rule on the site reads one custom property, `--font-sans`, so switching fonts off means overriding just that property:

```css
:root.font-fallback {
    --font-sans: var(--font-system);
}
```

vranjan.dev does the same job with a broader rule that forces the system font onto every element with `!important`, except code. That's the right tool when fonts are set in lots of places. When everything already goes through one variable, overriding the variable is enough.

There's a real performance side to this too. Browsers only download a web font when something on the page actually uses it. With the switch off, no element asks for Hanken Grotesk, so the 34.7 KB font file is never fetched at all.

### No font flicker between pages

The first version of this demo used `font-display: swap` with no preload, and it flickered on every navigation: each new page painted in the system font, then jumped to Hanken Grotesk a few frames later, nudging every line of text sideways. Recording the frames of a single link click showed it plainly: system font at 68 ms, Hanken Grotesk at 93 ms.

Two changes fixed it:

- **A preload, but only when fonts are on.** The head script adds `<link rel="preload" as="font" crossorigin>` for the font file, so the download starts alongside the stylesheet instead of after the page has been laid out. Because the script adds it, readers who switched web fonts off never get the preload, and still never download the file.
- **`font-display: optional` instead of `swap`.** With `optional`, the browser gets one very short window to use the font. If it's ready (it's cached after the first page), the page paints in Hanken Grotesk from the very first frame. If it isn't, that page view keeps the system font and never swaps mid-read. Either way the text never jumps.

The trade-off: on someone's very first visit over a slow connection, the first page may show the system font. Every page after that uses the web font from the first paint.

## Folder Structure

```text
src/_includes/components/reader-toggles.njk     ← the two switches
src/_includes/components/footer.njk             ← puts them on every page
src/_includes/components/preferences-init.njk   ← head script before the CSS: theme, font class, font preload
src/_includes/components/css-preference-init.njk ← head script after the CSS: disables it if switched off
src/assets/js/preferences.js                    ← read/write the stored object (unit-tested)
src/assets/js/reader-toggles.js                 ← click handling, applying and syncing state
src/assets/scss/components/_switch.scss         ← the track-and-knob look
src/assets/scss/base/_fonts.scss                ← @font-face + the font-fallback override
```

## Important Files

{% codeFile "src/_includes/components/reader-toggles.njk" %}

{% codeFile "src/_includes/components/preferences-init.njk" %}

{% codeFile "src/_includes/components/css-preference-init.njk" %}

{% codeFile "src/assets/js/reader-toggles.js" %}

{% codeFile "src/assets/js/preferences.js" %}

{% codeFile "src/assets/scss/base/_fonts.scss" %}

## Notes

- Without JavaScript the switches are hidden, since they couldn't do anything. With CSS off they're always visible, because the rule that hides them is itself CSS.
- The two copies on this page stay in sync: change a switch here and the footer copy flips too, since `reader-toggles.js` updates every switch with the same `data-reader-toggle`.
- The first row of demo cards on the listing pages loads its thumbnails eagerly, not lazily, for the same no-flicker reason: lazy images that are already on screen still appear a frame after the text.
- Reduced motion is respected for free: this site's reset turns off transitions under `prefers-reduced-motion`, which covers the knob's slide.
