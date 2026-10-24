---
title: "RSS"
description: "A standards-compliant Atom feed for the blog, generated with @11ty/eleventy-plugin-rss."
tags: ["blog", "data", "plugins"]
date: 2026-01-28
difficulty: "Beginner"
thumbnail: /assets/images/demos/rss.svg
order: 70
demoBlock: "demo-live/rss.njk"
---

## How It Works

`@11ty/eleventy-plugin-rss` gives you a few filters — `dateToRfc3339`, `getNewestCollectionItemDate`, `absoluteUrl`, `htmlToAbsoluteUrls` — that handle the annoying parts of feed generation, like feed-format dates and turning relative links into absolute ones. `feed.njk` uses those filters while looping over `collections.posts` (already sorted newest-first) to build an **Atom** feed, with `permalink` set to `/feed.xml` so it lands at a predictable URL.

Despite the plugin's name, Atom is what this site actually publishes. Every feed reader that understands RSS 2.0 also understands Atom, and Atom's rules are stricter in useful ways: dates are RFC 3339 (`2026-02-21T00:00:00Z`) instead of RFC 822, and every entry needs a unique `<id>`. If you wanted RSS 2.0 instead, the same plugin ships `dateToRfc822` for its date format.

Every page also advertises the feed in its `<head>`, so browsers and readers can find it without anyone hunting for the link:

```html
<link rel="alternate" type="application/atom+xml" title="11ty Demos" href="/feed.xml" />
```

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
