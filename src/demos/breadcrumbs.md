---
title: "Breadcrumbs"
description: "A tiny, explicit breadcrumb-trail macro used at the top of every demo and blog post."
tags: ["navigation", "accessibility"]
date: 2026-02-01
difficulty: "Beginner"
thumbnail: /assets/images/demos/breadcrumbs.svg
order: 80
demoBlock: "demo-live/breadcrumbs.njk"
---

## How It Works

The `breadcrumbs` macro takes a plain ordered array, `[{ text, url }, ...]`, and renders it as an `<ol>`. Every item except the last is a link. The last one is plain text with `aria-current="page"` instead, since it's the page you're already on and shouldn't link to itself.

The trail gets built by hand in each layout (`demo.njk`, `blog-post.njk`) rather than pulled automatically from the URL. That's on purpose: deriving it from `/demos/dark-mode/` would just give you the raw segment `dark-mode` as a label, but writing it out lets the trail read "Home / Demos / Dark Mode" with real capitalization and spacing.

## Folder Structure

```text
src/_includes/components/breadcrumbs.njk   ← the macro
src/_includes/layouts/demo.njk              ← usage on every demo page
src/_includes/layouts/blog-post.njk         ← usage on every blog post
```

## Important Files

{% codeFile "src/_includes/components/breadcrumbs.njk" %}

## Notes

- Since the trail is just a template variable, it's easy to go deeper for some future nested content type, like `Home / Demos / Tags / css`, without touching the macro at all.
- `aria-label="Breadcrumb"` on the `<nav>` and `aria-current="page"` on the last item both matter for screen readers to announce the trail correctly. So yes, this is also an accessibility demo.
