---
title: "Do it at build time if you can"
description: "The fastest client-side code is code that never has to run."
date: 2026-02-15
---

Most of the demos on this site lean on the same idea: if something can be computed once, at build time, don't make the browser redo it on every visit. The table of contents, the syntax highlighting, the search index, all of it gets figured out while the site is being built, not while someone's looking at it.

It's a small mindset shift if you're used to frameworks that do everything client-side. Before reaching for JavaScript, it's worth asking whether the answer was already knowable when you ran `npm run build`.
