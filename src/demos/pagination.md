---
title: "Pagination"
description: "Splitting a big collection into numbered pages with Eleventy's built-in pagination feature."
tags: ["collections", "data"]
date: 2026-02-24
difficulty: "Intermediate"
thumbnail: /assets/images/demos/pagination.svg
order: 90
demoBlock: "demo-live/pagination.njk"
---

## How It Works

Eleventy has pagination built in. Add a `pagination` block to a template's front matter and point it at any array (usually a collection), and Eleventy runs that template once per chunk, generating a separate page each time.

```yaml
pagination:
    data: collections.posts
    size: 3
    alias: posts
```

Inside the template, `posts` is now just the slice of posts for the current page, and a `pagination` object is available with everything you need to build page links: `pagination.pageNumber` (0-indexed), `pagination.hrefs` (every page's URL, in order), and more. The blog listing on this site uses exactly this to become `/blog/`, `/blog/2/`, `/blog/3/`, and so on, with a computed `permalink` so page 1 lands at the clean `/blog/` URL instead of `/blog/1/`.

The numbered links above aren't a mockup. They're built from the real post count using the same `pager` macro `blog.njk` uses, and they go to the real paginated pages.

## Folder Structure

```text
src/blog.njk                     ← pagination front matter + permalink logic
src/_includes/components/pager.njk ← the numbered link list
src/_includes/demo-live/pagination.njk
```

## Important Files

{% codeFile "src/blog.njk" %}

{% codeFile "src/_includes/components/pager.njk" %}

## Notes

- By default, only the first paginated page gets added to `collections.all`, which is why `/blog/` shows up once in the header nav instead of three times.
- `pagination.hrefs` already has every page's URL computed for you. There's no need to build the list of links by hand.
- Page size is just a number. Bump `size: 3` up or down and the page count adjusts on its own.
