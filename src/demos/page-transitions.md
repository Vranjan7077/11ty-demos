---
title: "Smooth Page Transitions"
description: "Pages fade into each other with cross-document view transitions: a few lines of CSS, no JavaScript, and off for anyone who prefers reduced motion."
tags: ["css", "accessibility", "performance"]
date: 2026-10-25
difficulty: "Beginner"
thumbnail: /assets/images/demos/page-transitions.svg
order: 118
demoBlock: "demo-live/page-transitions.njk"
---

## How It Works

Following a link normally swaps one page for the next with a hard cut. Browsers can now animate between two separate pages of the same site, the way single-page apps animate between views, with no JavaScript framework involved. Each page opts in with one CSS rule:

```css
@view-transition {
    navigation: auto;
}
```

Both the page you're leaving and the page you're arriving at need that rule, which is automatic here since every page shares one stylesheet. When you follow a link, the browser takes a snapshot of the old page, renders the new one, and cross-fades between the two.

### Keeping the header still

The default is a fade of the whole page. That looks odd for parts that are identical on both pages, like the site header, which would flicker as the old copy fades out and the new one fades in. Giving an element a `view-transition-name` makes the browser treat it as its own layer and move it from its old position to its new one. Since the header is in the same place on every page, it simply stays put:

```css
.site-header {
    view-transition-name: site-header;
}

::view-transition-old(root),
::view-transition-new(root) {
    animation-duration: 0.2s;
}
```

The default fade lasts 0.25 seconds; 0.2 keeps navigation feeling quick.

### Respecting reduced motion

Some people get motion sickness from animated movement, and operating systems let them ask for less of it. The transition is switched off entirely for them:

```css
@media (prefers-reduced-motion: reduce) {
    @view-transition {
        navigation: none;
    }
}
```

## Folder Structure

```text
src/assets/scss/base/_transitions.scss   ← the whole feature
src/assets/scss/main.scss                ← includes it right after the base styles
```

## Important Files

{% codeFile "src/assets/scss/base/_transitions.scss" %}

## Notes

- Browsers that don't support cross-document transitions ignore the `@view-transition` rule and navigate as usual, so there's no fallback to write. Chrome and Edge support it, and Safari added it in version 18.2; Firefox doesn't yet.
- It only applies between pages on the same site. Links to other sites always navigate normally.
- It pairs well with {% demoLink "instant-navigation", "Instant Navigation" %}: when the next page is already prerendered, the fade starts the moment you click.
- If you turn styles off with the {% demoLink "reader-toggles", "CSS switch" %}, the rule is switched off with the rest of the stylesheet.
