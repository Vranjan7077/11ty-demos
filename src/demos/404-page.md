---
title: "404 Page"
description: "A real custom 404 page, served with a real 404 HTTP status — not a soft 404 that quietly returns 200."
tags: ["netlify", "content"]
date: 2026-07-22
difficulty: "Beginner"
thumbnail: /assets/images/demos/404-page.svg
order: 108
demoBlock: "demo-live/404-page.njk"
---

## How It Works

The page itself is a normal Markdown file with two front-matter settings doing the real work:

```yaml
permalink: /404.html
eleventyExcludeFromCollections: true
```

`permalink: /404.html` matters because Netlify specifically looks for a file at that exact path when it needs to serve an error page — not `/404/`, not `/not-found/`, that literal filename. `eleventyExcludeFromCollections: true` keeps it out of `collections.all` entirely, which is also why the {% demoLink "sitemap", "sitemap" %} never has to think about it: it's simply never a candidate in the first place, not filtered out after the fact.

The other half lives in `netlify.toml`, not in Eleventy at all:

```toml
[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

That `status = 404` is the part that's easy to miss and easy to get wrong. Without it, Netlify would serve the 404 page's content but report a `200 OK` to whatever requested it — a "soft 404" that looks fine to a human but tells search engines and monitoring tools the broken page is a real, working one.

## Folder Structure

```text
src/404.md    ← the page and its front matter
netlify.toml  ← the redirect that actually wires it up as a real error page
```

## Important Files

{% codeFile "src/404.md" %}

## Notes

- This only serves as a real 404 once deployed. Under `eleventy --serve` locally, an unmatched URL shows Eleventy's own dev-server error page instead, since the Netlify redirect rule that makes this work doesn't exist outside of Netlify's actual infrastructure.
- The content deliberately isn't just an apology. It's two real links (Demos, Search) and a way home — a 404 page's job is to get someone unstuck, not just to explain that they're stuck.
