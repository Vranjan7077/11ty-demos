---
title: "Resume Reading"
description: "Remember how far someone read into a long page and offer to take them back there next time they visit."
tags: ["javascript", "accessibility", "blog"]
date: 2026-10-24
difficulty: "Intermediate"
thumbnail: /assets/images/demos/resume-reading.svg
order: 116
demoBlock: "demo-live/resume-reading.njk"
---

## How It Works

Long pages are easy to leave halfway: a phone call, a closed tab, a link followed to somewhere else. This pattern, from [vranjan.dev](https://vranjan.dev/)'s blog, remembers where you stopped on every blog post and demo, and offers to take you back.

### Saving the position

As you scroll, the page remembers how far through it you are as a percentage rather than a pixel offset. Pixel offsets break as soon as the layout shifts — a narrower window, a font that loads late, an image above the fold — but 45% of the way down is still 45% of the way down.

It saves at most once a second while you're scrolling, and once more when the page is hidden or closed (`visibilitychange` and `pagehide`). On a phone, that last save is the one that counts, since people rarely close tabs there. Everything lives in one `localStorage` entry:

```json
{
    "v": 1,
    "pages": {
        "/blog/static-doesnt-mean-boring/": {
            "percent": 0.452,
            "title": "Static doesn't mean boring",
            "contentVersion": "3f9a1c2e",
            "updatedAt": 1793000000000
        }
    }
}
```

It also tidies up after itself. Under 3% counts as "only just opened", so nothing gets saved, and once you pass 95% the page counts as read and its entry is deleted. It keeps 30 pages at most, and forgets anything you haven't touched in 30 days. The `v` is a version number for the stored format, so if I ever change its shape, old data gets ignored instead of misread.

### Offering to resume

Come back to a page you left halfway and a "Continue reading" box shows up at the bottom, with how far you'd got. vranjan.dev jumps you straight back to the spot; here it asks first. A page that scrolls itself the moment it opens is disorienting, especially with a screen reader, so the jump only happens if you ask for it. When you do, it scrolls there and moves keyboard focus to the first heading or paragraph on screen, so your next Tab starts from where you are instead of from the top.

There are a few times it stays quiet on purpose. On a reload or the back button, the browser already puts you back where you were, so only fresh visits from a link get the offer. A link to a `#section` means you asked for a specific spot, so that wins. And if the page has changed since you were last there, the old percentage won't point at the same paragraph anymore. Each page carries a `data-content-version` (a short hash of its content) to catch exactly that.

## Folder Structure

```text
src/assets/js/reading-position-store.js   ← saving, pruning, and resume rules (unit-tested, no DOM)
src/assets/js/reading-position.js         ← scroll tracking, the offer, the list above
src/_includes/components/resume-reading.njk ← the "Continue reading" box
src/_11ty/filters/shortHash.js            ← data-content-version
src/_includes/layouts/blog-post.njk       ← data-reading-position on posts (and demo.njk on demos)
```

## Important Files

{% codeFile "src/assets/js/reading-position-store.js" %}

{% codeFile "src/assets/js/reading-position.js" %}

## Notes

- Nothing leaves the browser. There's no server-side reading history; clearing site data or using the "Forget all saved positions" button above removes everything.
- The "Continue reading" box is hidden when printing, alongside the header and footer in the {% demoLink "print-stylesheet", "print stylesheet" %}.
- Its companion on long pages is {% demoLink "back-to-top", "Back to Top" %}, which takes you the other way.
- The store logic is split from the DOM code so the rules (3%, 95%, 30 pages, 30 days, content version) are covered by plain Node unit tests.
