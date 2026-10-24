---
title: "This post is a draft"
description: "If you can read this, you're looking at a local or deploy-preview build. The live site has never heard of it."
date: 2026-10-24
draft: true
---

This post has `draft: true` in its front matter, so it only exists in two places: on your machine while `npm start` is running, and on Netlify deploy previews, where drafts are switched on on purpose so they can be proofread at a real URL before they go live.

A production build never writes this page at all. It isn't hidden, unlinked, or blocked with `robots.txt`; Eleventy drops it before rendering, so it's also missing from the blog listing, the RSS feed, the sitemap, and both search indexes.

To publish it, delete the `draft: true` line. The [Draft Posts demo](/demos/draft-posts/) explains how it works.
