---
title: "Copy Code Button"
description: "A real copy button on every code block on this site, added by one script, with no per-page setup."
tags: ["javascript", "accessibility"]
date: 2026-07-22
difficulty: "Beginner"
thumbnail: /assets/images/demos/copy-code-button.svg
order: 105
demoBlock: "demo-live/copy-code-button.njk"
---

## How It Works

One script, loaded sitewide through `main.js`, finds every `<pre>` on the page and wraps each one:

```js
document.querySelectorAll("pre").forEach((pre) => {
    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    // ...button gets appended to wrapper, not pre
});
```

The wrapper matters more than it looks. Code blocks scroll horizontally (`overflow-x: auto`), and a button positioned _inside_ a scrolling element can get clipped or scroll away with the content. Putting the button in a sibling wrapper instead — positioned relative to the wrapper, not the `pre` — keeps it pinned in the corner regardless of how far the code scrolls.

Clicking the button copies `pre`'s real text content via `navigator.clipboard.writeText()`, swaps the icon to a checkmark, and swaps it back after two seconds:

```js
await navigator.clipboard.writeText(code.innerText);
button.classList.add("is-copied");
button.innerHTML = CHECK_ICON;
setTimeout(() => {
    button.classList.remove("is-copied");
    button.innerHTML = COPY_ICON;
}, 2000);
```

If `navigator.clipboard` doesn't exist — an old browser, or a page loaded over plain HTTP instead of HTTPS — the whole script does nothing, on purpose. No button ever appears that wouldn't actually work.

## Folder Structure

```text
src/assets/js/copy-code.js       ← the whole feature, loaded sitewide via main.js
src/assets/scss/components/_code.scss ← .code-block-wrapper and .copy-code-button styles
```

## Important Files

{% codeFile "src/assets/js/copy-code.js" %}

## Notes

- This applies to literally every `<pre>` on the site, including the JSON dump on the {% demoLink "data-files", "Data Files" %} demo and every "Important Files" snippet everywhere — not just fenced code blocks in Markdown.
- The Clipboard API requires a secure context. It works on `localhost` during development and on the real deployed HTTPS site, but would silently do nothing if this were ever served over plain HTTP.
- No dependency was added for this. `navigator.clipboard` has been in every evergreen browser for years — reaching for a library here would just be extra weight for something the platform already does.
