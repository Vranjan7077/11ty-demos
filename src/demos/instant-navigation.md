---
title: "Instant Navigation"
description: "Speculation rules let the browser prerender the page behind a link while you're hovering over it, so clicking feels instant."
tags: ["performance", "javascript"]
date: 2026-10-25
difficulty: "Intermediate"
thumbnail: /assets/images/demos/instant-navigation.svg
order: 119
demoBlock: "demo-live/instant-navigation.njk"
---

## How It Works

Most of the time between clicking a link and seeing the page is spent waiting: for the HTML, then the CSS, then the first paint. The Speculation Rules API lets a page tell the browser which links are worth getting ready early. This site asks for a full **prerender**: the next page is loaded and rendered in a hidden tab, and clicking the link just swaps it in.

Every page includes one small block of JSON:

```json
{
    "prerender": [
        {
            "source": "document",
            "where": {
                "and": [
                    { "href_matches": "/*" },
                    { "not": { "href_matches": ["/.netlify/*", "/assets/*", "/pagefind/*", "/*.xml", "/*.json"] } },
                    { "not": { "selector_matches": "[data-no-prerender]" } }
                ]
            },
            "eagerness": "moderate"
        }
    ]
}
```

- **`"source": "document"`** means "look at the links on this page" rather than listing URLs by hand, so new demos and posts are covered automatically.
- **`where`** keeps it to this site's own pages. Feeds, JSON files, assets, and the serverless function are left out, and any single link can opt out with `data-no-prerender`.
- **`"eagerness": "moderate"`** starts prerendering when the pointer rests on a link for about 200 ms, or when a finger touches it on a phone. That's a strong sign of intent without loading pages nobody clicks.

The rules sit inside `<script type="speculationrules">`, which browsers treat as data rather than code. This site's Content Security Policy is generated from the real build output, so the block's hash is allowed automatically, like any other inline script.

### Pages that do things when they load

The catch is that a prerendered page runs its JavaScript before you've decided to visit it. On this site that bit twice. The {% demoLink "view-counter", "View Counter" %} would count a visit just because someone hovered a link, and {% demoLink "resume-reading", "Resume Reading" %} could save a position for a page that was never shown. Both now wait until the page is actually displayed:

```js
export function whenActivated(callback) {
    if (document.prerendering) {
        document.addEventListener("prerenderingchange", callback, { once: true });
    } else {
        callback();
    }
}
```

`document.prerendering` is `true` while the page is being prepared in the background, and `prerenderingchange` fires the moment it's swapped in.

## Folder Structure

```text
src/_includes/components/speculation-rules.njk   ← the rules, included in every page's <head>
src/assets/js/when-activated.js                   ← delays side effects until a page is shown
src/assets/js/view-counter.js                     ← uses it so hovering doesn't count as a view
src/assets/js/reading-position.js                 ← uses it so hovering doesn't save a position
src/assets/js/navigation-status.js                ← the status line above
```

## Important Files

{% codeFile "src/_includes/components/speculation-rules.njk" %}

{% codeFile "src/assets/js/when-activated.js" %}

## Notes

- Chrome and Edge support speculation rules. Other browsers ignore the block and load pages normally when clicked.
- Browsers skip prerendering by themselves when it would hurt: in data-saver or battery-saver mode, on low memory, or when too many prerenders are already running.
- Prerendering does use bandwidth for pages that end up not being opened. `moderate` eagerness keeps that small; `eager` would start on every link the moment it's visible, which is too much for a page full of demo cards.
- It pairs with {% demoLink "page-transitions", "Smooth Page Transitions" %}: the prerendered page is ready, so the fade starts as soon as you click.
