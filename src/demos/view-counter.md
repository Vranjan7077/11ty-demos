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

A small Netlify Function keeps a number in Netlify Blobs (a key-value store bundled with every Netlify site). It speaks plain HTTP semantics:

- `GET /.netlify/functions/views?key=view-counter-demo` reads the current count and changes nothing.
- `POST` to the same URL adds one and returns the new total.
- Anything else gets a `405`, and any `key` that isn't on a short allowlist gets a `400`, so nobody can fill the store with junk keys by inventing new ones.

The tricky part is adding one safely. Reading the number and writing it back as two separate steps means two visits landing at the same instant could both read `41` and both write `42`, losing a view. Netlify Blobs has a real answer for that: every entry has an ETag, and a write can say "only if the ETag still matches what I read":

```js
const entry = await store.getWithMetadata(key, { type: "text", consistency: "strong" });
const next = (entry ? parseCount(entry.data) : 0) + 1;
const condition = entry ? { onlyIfMatch: entry.etag } : { onlyIfNew: true };
const { modified } = await store.set(key, String(next), condition);
```

If another visit got there first, `modified` comes back `false`, and the function simply reads again and retries, a few times at most. That's optimistic concurrency, not a lock: nothing waits, and a write can never silently overwrite a newer count.

On page load, a small script `POST`s once per browser session and then switches to `GET` for later reloads in the same tab session, so refreshing doesn't inflate the number.

## Folder Structure

```text
netlify/functions/views.js                ← the function entry point, three lines
netlify/lib/view-counter.js               ← validation, methods, and the compare-and-swap increment
src/assets/js/view-counter.js             ← calls it and renders the count
src/_includes/demo-live/view-counter.njk  ← this widget's markup
test/view-counter.test.js                 ← tests, including racing requests
```

## Important Files

{% codeFile "netlify/functions/views.js" %}

{% codeFile "netlify/lib/view-counter.js" %}

{% codeFile "src/assets/js/view-counter.js" %}

## Notes

- This only works once deployed on Netlify — Netlify Functions and Netlify Blobs don't exist when running `eleventy --serve` locally, so on localhost the widget will show "unavailable" instead of a number. That's the fetch failing gracefully, not a bug.
- Keeping the logic in `netlify/lib/` and passing `getStore` in makes the whole function testable with a fake in-memory store, no Netlify account needed. The tests fire several `POST`s at once and check that every one of them was counted.
- Under extreme contention, a request that loses the race five times in a row gets a `503` with `Retry-After` instead of a wrong number. For a demo page that will essentially never happen.
- Hovering a link to this page can make the browser prerender it in the background (see {% demoLink "instant-navigation", "Instant Navigation" %}). The script waits for `prerenderingchange` before counting, so only a page that's actually shown counts as a view.
- It's still not analytics: there's no bot filtering, and clearing session storage counts you again. That trade-off is what keeps this to a few small files instead of a whole tracking pipeline.
