---
title: "Multi-level Navigation"
description: "A recursive, front-matter-driven navigation tree using @11ty/eleventy-navigation — no hand-maintained nav array."
tags: ["navigation", "accessibility", "plugins"]
date: 2026-01-12
difficulty: "Intermediate"
thumbnail: /assets/images/demos/multi-level-navigation.svg
order: 20
demoBlock: "demo-live/multi-level-navigation.njk"
eleventyNavigation:
    key: Multi-level Navigation
    parent: Demos
    order: 2
---

## How It Works

Instead of maintaining a separate navigation data file, every page that should appear in the nav declares it in its own front matter:

```yaml
eleventyNavigation:
    key: Dark Mode
    parent: Demos
    order: 1
```

The `@11ty/eleventy-navigation` plugin scans `collections.all`, builds a tree out of those `key`/`parent`/`order` relationships, and hands it back through a filter: `collections.all | eleventyNavigation`. The `nav-primary.njk` component renders that tree with one recursive macro, so it calls itself whenever an entry has children. That means you can nest as deep as you want without writing any extra template code.

This very page is one of the four children under **Demos** in the header. Open the menu and you'll see the rest.

## Folder Structure

```text
src/
  _includes/components/nav-primary.njk   ← recursive render
  demos/*.md                              ← eleventyNavigation front matter
  index.njk, demos.njk, blog.njk, about.md
```

## Important Files

{% codeFile "src/_includes/components/nav-primary.njk" %}

## Notes

- Active-page highlighting is a plain comparison: `entry.url == page.url`.
- To go three levels deep, add a page whose `parent` points at a key that already has a `parent` of its own — the same macro handles it.
- On small screens, the same markup is shown/hidden by a CSS class toggled from `main.js`; no separate mobile menu template exists.
