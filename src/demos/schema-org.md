---
title: "Schema.org / JSON-LD"
description: "Real structured data on every demo page and the listing page, with a script-injection risk most tutorials skip."
tags: ["data", "content"]
date: 2026-07-22
difficulty: "Intermediate"
thumbnail: /assets/images/demos/schema-org.svg
order: 109
demoBlock: "demo-live/schema-org.njk"
---

## How It Works

Every demo page emits a real `TechArticle` schema, and the {% demoLink "collections", "demos listing" %} emits a `CollectionPage` wrapping an `ItemList` of every real demo — not placeholder data, the same `collections.demos` every other page on this site already uses:

{% raw %}

```njk
{% set schema = {
  "@type": "CollectionPage",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": collections.demos | demosToItemList(site.url)
  }
} %}
<script type="application/ld+json">{{ schema | jsonLd | safe }}</script>
```

{% endraw %}

Two details here are easy to get wrong, and both matter more than the schema shape itself.

**The `| safe` is not optional.** Nunjucks HTML-escapes {% raw %}`{{ }}`{% endraw %} output by default — quotes become `&quot;`. That's correct behavior for HTML text, and exactly wrong for JSON, which needs its literal `"` characters intact. Drop `| safe` here and every JSON-LD block on the site silently becomes invalid JSON that still "looks fine" until something actually tries to parse it.

**`JSON.stringify()` alone isn't safe to embed in a `<script>` tag.** A browser's HTML parser looks for the literal text `</script>` to know where a script tag ends — before it knows or cares that the tag holds JSON. If any value in the object ever contained that exact sequence, `JSON.stringify()` would happily leave it untouched, and the HTML parser would close the tag early, turning whatever came next into real, executing markup. `jsonLd` is `JSON.stringify` plus one more pass:

```js
export default function jsonLd(value) {
    return JSON.stringify(value).replace(/</g, "\\u003C");
}
```

Every `<` in the serialized JSON becomes the six-character escape sequence backslash-u-zero-zero-three-C — still a perfectly valid `<` once `JSON.parse()` reads it back, but no longer spelling `</script>` anywhere in the raw HTML the browser's parser actually scans.

## A design choice worth explaining

The usual version of this fix escapes each dynamic field individually, right where it's interpolated. This site does it once, on the whole serialized object, after every field is already in place. That's a deliberate trade: escaping field-by-field means remembering to add it to every new field forever; escaping the final string once means there's nothing to remember — it's structurally impossible to add a new field and forget the escaping, because the escaping doesn't happen at the field level at all.

## Folder Structure

```text
src/_11ty/filters/jsonLd.js           ← JSON.stringify + </script> protection
src/_11ty/filters/demosToItemList.js  ← collections.demos → real ItemList array
src/_includes/layouts/demo.njk        ← TechArticle, on every demo page
src/demos.njk                         ← CollectionPage/ItemList, on the listing
```

## Important Files

{% codeFile "src/_11ty/filters/jsonLd.js" %}

{% codeFile "src/_11ty/filters/demosToItemList.js" %}

## Notes

- Every field going into these objects on this site is content its own author wrote — titles, descriptions, tags. Nothing here comes from an RSS feed, a form, or any other source outside this repo. The escaping is real and correct regardless, but the actual risk on this particular site is low; it's a different story on any site aggregating outside content into JSON-LD, which is a deeper rabbit hole than this demo goes into.
- `demosToItemList` takes `site.url` as an argument instead of importing it, so it stays a plain, testable function with no hidden dependency on Eleventy's global data.
