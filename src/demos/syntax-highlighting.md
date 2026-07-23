---
title: "Syntax Highlighting"
description: "Build-time code highlighting with @11ty/eleventy-plugin-syntaxhighlight — zero client-side JavaScript."
tags: ["code", "plugins", "performance"]
date: 2026-01-18
difficulty: "Beginner"
thumbnail: /assets/images/demos/syntax-highlighting.svg
order: 40
demoBlock: "demo-live/syntax-highlighting.njk"
---

## How It Works

`@11ty/eleventy-plugin-syntaxhighlight` wraps Prism's highlighting logic and runs it entirely at **build time**. It hooks into markdown-it's fenced-code-block renderer, so every ` ```js ` block in any Markdown file on this site is already highlighted by the time it reaches your browser. No highlighter library ever ships to the client.

It also gives you a `highlight` paired shortcode you can use directly inside `.njk` templates, not just Markdown. That's what's powering the two code blocks in the Live Implementation section above, since that partial is a Nunjucks include rather than Markdown.

Prism wraps each token in a `<span class="token ...">` class. The actual colors come from this site's own `_code.scss` file, not a downloaded Prism theme, so the highlighting just matches the site's palette in both light and dark mode automatically.

## The Client-Side Alternative

Most syntax highlighting on the web still works the other way around: ship a highlighter library to the browser, and have it scan the page and add color classes after the page has already loaded.

```html
<link rel="stylesheet" href="prism.css" />
<script src="prism.js"></script>

<pre><code class="language-js">const x = 1;</code></pre>
```

That works, but it comes with real cost: an extra script and stylesheet on every page view, a highlighter re-running in every visitor's browser even though the code in the post never changes, and a brief flash of plain, unstyled code while the script loads and runs. None of that is disastrous on its own, but all of it is avoidable — the code isn't going to look any different tomorrow than it does today, so there's no reason to redo the work on every visit. Build-time highlighting just moves that same computation from "every page load" to "once, when the site builds."

## Folder Structure

```text
eleventy.config.js                        ← eleventyConfig.addPlugin(pluginSyntaxHighlight)
src/_includes/demo-live/syntax-highlighting.njk  ← highlight shortcode usage
src/assets/scss/components/_code.scss     ← Prism token color theming
```

## Important Files

{% codeFile "eleventy.config.js", 4, 4 %}

{% codeFile "eleventy.config.js", 20, 20 %}

## Notes

- No client-side JS ships for highlighting. It's pure server-rendered markup and CSS.
- Since tokens are just CSS classes, dark mode support comes for free — the color rules live under the same `[data-theme]` selectors as the rest of the site.
