---
title: "Collections"
description: "A custom collection that merges two different content types into one sorted list."
tags: ["collections", "data"]
date: 2026-02-25
difficulty: "Intermediate"
thumbnail: /assets/images/demos/collections.svg
order: 91
demoBlock: "demo-live/collections.njk"
---

## How It Works

Every collection on this site so far, `demos`, `demoTags`, `posts`, has been "every file matching this one glob, sorted somehow." A collection doesn't have to work that way. It's just a function that returns an array, and that array can come from anywhere.

`recentActivity` grabs every demo and every blog post, from two completely different folders, mashes them into one array, and sorts the whole thing by date:

```js
export default function recentActivity(collectionApi) {
    const demos = collectionApi.getFilteredByGlob("src/demos/*.md");
    const posts = collectionApi.getFilteredByGlob("src/blog/*.md");
    return [...demos, ...posts].sort((a, b) => b.date - a.date);
}
```

That's the whole thing. No config, no plugin. Once it's saved in `src/_11ty/collections/`, `registerFromGlob` picks it up and `collections.recentActivity` is available in every template on the site.

## Folder Structure

```text
src/_11ty/collections/recentActivity.js ← the collection itself
src/_includes/demo-live/collections.njk  ← usage
```

## Important Files

{% codeFile "src/_11ty/collections/recentActivity.js" %}

## Notes

- Collections are computed fresh on every build, so there's no caching bug where a merged list gets out of sync with its sources.
- Nothing stops a collection from filtering, deduping, or even fetching from outside the `src/` folder entirely (a local JSON file, for instance). It's just JavaScript.
- If you only need to change how items are sorted or filtered, you often don't need a whole new collection. A filter, like the ones behind `relatedDemos` or `byTag`, can do the job from inside a template instead.
