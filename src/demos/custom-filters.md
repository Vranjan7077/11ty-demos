---
title: "Custom Filters"
description: "How this site turns a file into a Nunjucks filter automatically, using a new real pluralize filter as the example."
tags: ["plugins", "content"]
date: 2026-07-22
difficulty: "Beginner"
thumbnail: /assets/images/demos/custom-filters.svg
order: 100
demoBlock: "demo-live/custom-filters.njk"
---

## How It Works

Every filter on this site — `readableDate`, `toc`, `pluralize`, all of them — is a single file under `src/_11ty/filters/` that default-exports a function. Nothing registers them by name; a small helper scans the folder at build time and calls `addFilter(filename, fn)` for every file it finds:

```js
export default function pluralize(count, singular, plural) {
    const word = count === 1 ? singular : plural || `${singular}s`;
    return `${count} ${word}`;
}
```

Drop that in as `pluralize.js` and {% raw %}`{{ count | pluralize("demo") }}`{% endraw %} works immediately, everywhere, with zero lines added to `eleventy.config.js`. This isn't a toy example either — the real [tag pages](/demos/tags/) used to have {% raw %}`{{ matching.length }} demo{% if matching.length != 1 %}s{% endif %}`{% endraw %} inline in the template to handle the singular/plural case by hand. `pluralize` replaced it outright.

Four more live below, same mechanism, different jobs:

- `excerpt` trims text to a word count — it's the filter actually capping the descriptions on the [demos listing](/demos/), so one long sentence can't stretch a card taller than its neighbors.
- `formatNumber` adds thousands separators to a number.
- `timeAgo` turns a date into "3 months ago" — it reuses `pluralize` internally for the unit word, rather than re-deriving the same singular/plural logic twice.
- `absoluteUrl` isn't hand-written at all. It ships with `@11ty/eleventy-plugin-rss` and is what turns every relative link into a real, absolute one in this site's actual [RSS feed](/feed.xml). A filter doesn't have to come from `src/_11ty/filters/` to work exactly the same way from a template's point of view.

## Folder Structure

```text
src/_11ty/registerFromGlob.js       ← scans the folder, calls addFilter(name, fn) for each file
src/_11ty/filters/pluralize.js      ← used on real tag pages
src/_11ty/filters/excerpt.js        ← used on real demo card descriptions
src/_11ty/filters/formatNumber.js
src/_11ty/filters/timeAgo.js        ← used on the real blog listing, imports pluralize.js directly
src/tags.njk                        ← where pluralize replaced hand-written singular/plural logic
src/_includes/components/demo-card.njk ← where excerpt caps description length
src/blog.njk                        ← where timeAgo is used for real
```

## Important Files

{% codeFile "src/_11ty/filters/pluralize.js" %}

{% codeFile "src/_11ty/filters/excerpt.js" %}

{% codeFile "src/_11ty/filters/timeAgo.js" %}

## Notes

- The filename is the filter name. Renaming `pluralize.js` to something else changes what you'd type on the right-hand side of every `|` that uses it — same "filename is the contract" rule as {% demoLink "data-files", "Data Files" %}.
- Nunjucks filters have to be synchronous, which is why these are all plain functions — Eleventy's async-filter support exists, but `registerFromGlob` here always calls the plain `addFilter`, so an `async function` in this folder wouldn't be awaited correctly.
- `timeAgo` importing `pluralize.js` directly (not through the Nunjucks filter pipeline) works because they're both just plain JavaScript files — `registerFromGlob` registering one as a filter doesn't stop the other from importing it normally.
