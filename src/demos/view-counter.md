---
title: "Live View Counter"
description: "A real page-view counter backed by a Netlify Function and Netlify Blobs, no third-party analytics account needed."
tags: ["netlify", "data", "javascript"]
date: 2026-07-22
difficulty: "Intermediate"
thumbnail: /assets/images/demos/view-counter.svg
order: 98
demoBlock: "demo-live/view-counter.njk"
---

## How It Works

Sites like [zachleat.com](https://www.zachleat.com/) show a running view count in the footer, powered by a real analytics backend. This demo does the same thing, but with the smallest possible setup: no third-party account, nothing beyond Netlify itself.

A tiny Netlify Function reads a number out of Netlify Blobs (a key-value store bundled with every Netlify site), adds one, writes it back, and returns the new total as JSON:

```js
import { getStore } from "@netlify/blobs";

export default async (request) => {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") || "site";

    const store = getStore("page-views");
    const current = await store.get(key, { type: "text" });
    const next = (parseInt(current, 10) || 0) + 1;
    await store.set(key, String(next));

    return new Response(JSON.stringify({ key, views: next }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
};
```

The `key` query param scopes the counter, so this same function could track separate counts for every page on the site just by passing a different key — this demo only asks for `view-counter-demo`, so it counts visits to itself.

On page load, a small script calls that function and drops the number straight into the page. No build step, no schedule, no lag — every real visit changes the number immediately.

## Folder Structure

```text
netlify/functions/views.js                      ← the counter function
src/assets/js/view-counter.js                    ← calls it and renders the count
src/_includes/demo-live/view-counter.njk         ← this widget's markup
```

## Important Files

{% codeFile "netlify/functions/views.js" %}

{% codeFile "src/assets/js/view-counter.js" %}

## Notes

- This only works once deployed on Netlify — Netlify Functions and Netlify Blobs don't exist when running `eleventy --serve` locally, so on localhost the widget will show "unavailable" instead of a number. That's the fetch failing gracefully, not a bug.
- Every page load counts as a view, including your own refreshes — there's no bot filtering or de-duplication here, unlike a real analytics service. That trade-off is what keeps this demo to two small files instead of a whole tracking pipeline.
- The read-then-write isn't atomic, so two visits landing in the exact same instant could both read the same starting number and one increment could get lost. For a low-traffic demo page that's not worth solving for; a high-traffic counter would want a datastore with a real atomic increment instead.
