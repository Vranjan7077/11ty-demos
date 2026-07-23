---
title: "Reading Time"
description: "The 'N min read' shown on every demo and post here, computed at build time by eleventy-plugin-reading-time."
tags: ["plugins", "content"]
date: 2026-07-22
difficulty: "Beginner"
thumbnail: /assets/images/demos/reading-time.svg
order: 97
demoBlock: "demo-live/reading-time.njk"
---

## How It Works

Every "N min read" on this site — on demo cards, at the top of this page, under every blog post — comes from [eleventy-plugin-reading-time](https://github.com/johanbrook/eleventy-plugin-reading-time). It registers a `readingTime` Nunjucks filter that counts words in the rendered content and divides by a words-per-minute estimate:

```js
import pluginReadingTime from "eleventy-plugin-reading-time";

eleventyConfig.addPlugin(pluginReadingTime);
```

From there it's just a filter, used the same way anywhere page content is available: {% raw %}`{{ content | readingTime }} read`{% endraw %}.

## The Hand-Rolled Alternative

This site didn't always use the plugin. It started with a five-line filter doing the same basic job, no dependency at all:

```js
export default function readingTime(content = "") {
    const text = String(content).replace(/<[^>]*>/g, " ");
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
}
```

Both versions do the same thing: strip HTML tags, count words, divide by a reading speed. The hand-rolled one is fully self-contained and format the output however you like. The plugin trades that for code someone else maintains, plus a couple of extra conveniences, like accepting a whole page object instead of just a content string. Neither is really "more correct" — for something this small, the choice mostly comes down to whether you'd rather own five lines or a dependency. This page now uses the plugin, so its "Important Files" section below points at real, reusable code instead of a snippet only this site would recognize.

## Folder Structure

```text
eleventy.config.js                          ← where the plugin gets registered
src/_includes/demo-live/reading-time.njk    ← this widget
```

## Important Files

{% codeFile "src/_includes/demo-live/reading-time.njk" %}

## Notes

- The plugin's output format is `N min` (no "read" suffix), so every template that uses the filter appends " read" itself, same as it did with the hand-rolled version.
- Word-per-minute estimates are just that — estimates, not a measurement of how fast any real visitor reads. The hand-rolled version above assumed 200 words a minute; the plugin defaults to 300, which is why the numbers on this site shifted slightly when it switched over.
