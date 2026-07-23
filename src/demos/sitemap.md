---
title: "Sitemap"
description: "A real sitemap.xml with two genuine Eleventy gotchas baked into how it's built — one about pagination, one about a phantom URL."
tags: ["data", "collections"]
date: 2026-07-22
difficulty: "Intermediate"
thumbnail: /assets/images/demos/sitemap.svg
order: 107
demoBlock: "demo-live/sitemap.njk"
---

## How It Works

The obvious version of a sitemap is a loop over `collections.all`. That's where this one starts too — but two real Eleventy behaviors meant the obvious version was wrong, and both are worth knowing about before they surprise you somewhere that matters more than a sitemap.

**Gotcha one: `collections.all` only holds the _first_ page of anything paginated.** The {% demoLink "tags", "tag pages" %} are built with Eleventy's pagination feature — one input template, one output page per tag. Only the very first generated page from a paginated template ends up in `collections.all`; the rest exist as real, working, deployed pages that `collections.all` simply doesn't know about. Loop over `collections.all` for a sitemap and every tag page except the first one silently goes missing. The fix is to add them back by hand, from the same `collections.demoTags` array the tag pages themselves are built from:

{% raw %}

```njk
{%- for tag in collections.demoTags %}
  <url><loc>{{ site.url }}/demos/tags/{{ tag | slugify }}/</loc></url>
{%- endfor %}
```

{% endraw %}

The {% demoLink "pagination", "blog's paginated pages" %} (`/blog/2/`, `/blog/3/`) have the identical problem, fixed the identical way — reconstructed from a hardcoded page size matching the real pagination config.

**Gotcha two: a phantom URL that isn't a page at all.** This site's custom Sass build extension returns `undefined` for any `_partial.scss` file, since partials don't produce their own output. Eleventy still registers a `.css`-suffixed entry for it in `collections.all` anyway — a URL for a file that's never actually written. The fix is a one-line filter, since every _real_ page URL on this site ends in a trailing slash and no phantom entry does:

{% raw %}

```njk
{%- if entry.url and entry.url.endsWith("/") %}
```

{% endraw %}

## Folder Structure

```text
src/sitemap.njk ← the whole thing, one file
```

## Important Files

{% codeFile "src/sitemap.njk" %}

## Notes

- Both bugs were caught by comparing the sitemap's URL count against the real number of built HTML files, not by reading the template and assuming it was right. It wasn't, twice.
- The blog page-size number in this file is hardcoded to match `blog.njk`'s real `pagination.size`. If that ever changes, this file has to change with it — there's no automatic link between the two.
