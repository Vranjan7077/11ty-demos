---
title: "About"
description: "What this site is, and the front-matter contract for adding a new demo."
layout: layouts/page.njk
eleventyNavigation:
    key: About
    order: 4
---

I got tired of scattering Eleventy examples across a dozen half-finished repos, so I put them all here instead — one page per pattern. And every demo is the real thing, not a screenshot of it. The Dark Mode demo is the site's actual theme toggle. The Search demo is the actual header search. If you click something, it works.

## Adding a new demo

Drop a Markdown file into `src/demos/` with front matter like this:

```yaml
---
title: "Your Demo Title"
description: "One sentence describing what this demo actually does."
tags: ["some-tag", "another-tag"]
date: 2026-08-01
difficulty: "Intermediate" # Beginner | Intermediate | Advanced
thumbnail: /assets/images/demos/your-demo-title.svg
order: 90 # optional; controls listing order
demoBlock: "demo-live/your-demo-title.njk" # optional; a live, working example
---
```

That's it. The new demo:

- Gets the shared layout and hero automatically (`src/demos/demos.json` sets the default `layout` and permalink).
- Appears on `/demos/` immediately (the listing loops the `demos` collection).
- Gets a page for each of its tags under `/demos/tags/` automatically.
- Is included in `/search-index.json`, and therefore in the header search.
- Slots into Previous/Next navigation based on its `order` (or title, if `order` is omitted).
- Shows up in other demos' "Related Demos" sections if it shares tags with them.

No other file needs to change.
