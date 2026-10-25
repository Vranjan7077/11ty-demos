---
title: "Draft Posts"
description: "Mark a page draft: true and it shows up locally and on deploy previews, but never on the live site."
tags: ["content", "netlify", "blog"]
date: 2026-10-24
difficulty: "Beginner"
thumbnail: /assets/images/demos/draft-posts.svg
order: 113
demoBlock: "demo-live/draft-posts.njk"
---

## How It Works

Any demo or post can carry one extra line of front matter:

```yaml
draft: true
```

Eleventy 3 has a hook for exactly this, `addPreprocessor`. It runs on every template before it's rendered, and returning `false` drops that template from the build completely:

```js
eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && !shouldIncludeDrafts()) return false;
});
```

`shouldIncludeDrafts()` makes the call for each build. While you're running `npm start`, drafts show up like any other page, so you can write and preview them as normal. A production build leaves them out. Netlify deploy previews are the one exception: `netlify.toml` sets `INCLUDE_DRAFTS=true` for previews only, so opening a pull request gives the draft a real URL you can send someone to proofread, while the live site still has no idea it exists.

```toml
[context.deploy-preview.environment]
  INCLUDE_DRAFTS = "true"
```

A dropped template never even gets rendered, so there's nothing to hide. No page, no entry in the blog listing or {% demoLink "pagination", "pagination" %}, nothing in the {% demoLink "rss", "feed" %}, the {% demoLink "sitemap", "sitemap" %}, or either search index. There's no link to forget to remove.

When a draft _is_ built, it gets a dashed "Draft" banner and `<meta name="robots" content="noindex">`, so a preview URL that leaks can't end up in search results.

## Folder Structure

```text
src/_11ty/drafts.js                         ← shouldIncludeDrafts(), plus finding drafts for this page
eleventy.config.js                          ← the addPreprocessor hook
netlify.toml                                ← INCLUDE_DRAFTS=true for deploy previews only
src/_data/drafts.js                         ← lists drafts for the Live Implementation above
src/blog/drafts-stay-out-of-production.md   ← a real draft
src/_includes/layouts/base.njk              ← noindex on draft pages
```

## Important Files

{% codeFile "src/_11ty/drafts.js" %}

## Notes

- Publishing is deleting one line. There's no separate drafts folder to move files out of, so a draft's URL is the same before and after it goes live.
- The build smoke tests check that no draft is written in a production build and that none of them appear in the feed, sitemap, or search index.
- `addPreprocessor` is new in Eleventy 3. On older versions the usual trick was a computed `permalink: false` plus `eleventyExcludeFromCollections`, which needs both halves to be right; the preprocessor does it in one place.
