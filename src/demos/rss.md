---
title: "RSS"
description: "A standards-compliant Atom/RSS feed for the blog, generated with @11ty/eleventy-plugin-rss."
tags: ["blog", "data", "plugins"]
date: 2026-01-28
difficulty: "Beginner"
thumbnail: /assets/images/demos/rss.svg
order: 70
demoBlock: "demo-live/rss.njk"
---

## How It Works

`@11ty/eleventy-plugin-rss` gives you a few filters — `dateToRfc822`, `absoluteUrl`, `htmlToAbsoluteUrls` — that handle the annoying parts of feed generation, like RFC-822 dates and turning relative links into absolute ones. `feed.njk` uses those filters while looping over `collections.posts` (already sorted newest-first) to build a standard RSS 2.0 document, with `permalink` set to `/feed.xml` so it lands at a predictable URL.

Since it reads from the same `posts` collection the blog listing uses, a new post shows up in the feed the moment it shows up on the site. There's nothing separate to write.

## Folder Structure

```text
src/feed.njk                    ← permalink: /feed.xml, the feed template itself
src/blog/*.md                    ← posts collection source
src/_11ty/collections/posts.js ← posts(): sorts by date, newest first
```

## Important Files

{% codeFile "src/feed.njk" %}

## Notes

- Right now only the blog scaffold feeds this. You could fold demos into the same feed too by merging `collections.demos` into the loop.
- `feed.njk` is `.njk`, not `.md`, because XML output shouldn't go through the Markdown renderer.
