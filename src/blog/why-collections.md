---
title: "Why collections instead of just looping folders"
description: "Collections aren't folders. They're just arrays you build however you want."
date: 2026-02-12
---

The first time I used Eleventy, I assumed a collection was just "the files in this folder." It isn't. A collection is whatever array your `addCollection` function returns. It can pull from a glob, filter by tag, mix content from two different folders, or compute something that isn't backed by files at all.

That flexibility is the whole point. Once you stop thinking of collections as folder listings and start thinking of them as "any array I can build in JavaScript," you stop fighting the tool.
