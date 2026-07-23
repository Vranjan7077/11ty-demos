---
title: "Shortcodes"
description: "How a file becomes a Nunjucks shortcode on this site, using a real icon shortcode that replaced inline SVG markup."
tags: ["plugins", "content"]
date: 2026-07-22
difficulty: "Beginner"
thumbnail: /assets/images/demos/shortcodes.svg
order: 101
demoBlock: "demo-live/shortcodes.njk"
---

## How It Works

Shortcodes register the exact same way {% demoLink "custom-filters", "filters" %} do — one file, one default export, filename becomes the name — just through `addShortcode` instead of `addFilter`:

```js
import fs from "node:fs";
import path from "node:path";

export default function icon(name, className) {
    const filePath = path.join(process.cwd(), "src/assets/icons", `${name}.svg`);
    const raw = fs.readFileSync(filePath, "utf8");
    return className ? raw.replace("<svg", `<svg class="${className}"`) : raw;
}
```

`{% raw %}{% icon "eye", "view-counter__icon" %}{% endraw %}` reads a real SVG file off disk and inlines it directly into the page, with a class attribute spliced in. This isn't illustrative — it's the actual {% demoLink "view-counter", "View Counter" %} demo's eye icon. That widget used to have the raw `<svg>` markup pasted directly into its template; now it's one line, and the same shortcode works for any icon dropped into `src/assets/icons/`.

The difference between a filter and a shortcode is really just the calling syntax: a filter transforms a value that's already in scope (`{% raw %}{{ value | filterName }}{% endraw %}`), while a shortcode is called like a function with its own arguments (`{% raw %}{% shortcodeName arg1, arg2 %}{% endraw %}`) — useful when there isn't an existing value to pipe something through.

`demoLink` is the second shortcode on this site, and it's a smaller, plainer example: two arguments in, one `<a>` tag out. It's what generated the "filters" and "View Counter" links a few sentences up — real links to real pages, not typed out by hand.

Not every shortcode here is custom-written, either. The {% demoLink "syntax-highlighting", "Syntax Highlighting" %} demo's code blocks run through `highlight`/`endhighlight`, a _paired_ shortcode that ships with `@11ty/eleventy-plugin-syntaxhighlight` — it wraps a block of content between its open and close tags instead of just taking arguments, which is the other shape shortcodes commonly take.

## Folder Structure

```text
src/_11ty/shortcodes/icon.js             ← reads a real SVG file, returns HTML
src/_11ty/shortcodes/demoLink.js         ← builds a link from two arguments, returns HTML
src/assets/icons/eye.svg, check.svg      ← the actual icon files icon.js reads
src/_includes/demo-live/view-counter.njk ← real usage of icon, not just this demo
```

## Important Files

{% codeFile "src/_11ty/shortcodes/icon.js" %}

{% codeFile "src/_11ty/shortcodes/demoLink.js" %}

## Notes

- `codeFile` — the shortcode behind every "Important Files" section on this site, including the one above — returns a Markdown code fence as a string, not HTML. That only works because it's called from actual Markdown content, which gets parsed after shortcodes expand. Calling it from a `.njk` partial like this page's own Live Implementation block wouldn't work: `.njk` files never go through the Markdown parser, so the fence characters would show up as literal text instead of a highlighted code block.
- `icon` and `demoLink` both sidestep that problem by returning real HTML directly, which is safe to use from any template, Markdown or not — that's a deliberate choice, not an accident, and it's why this page's own Live Implementation block below can call `demoLink` directly.
