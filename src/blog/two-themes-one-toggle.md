---
title: "Two themes, one toggle"
description: "What I cut and kept when I rebuilt the theme toggle on vranjan.dev, and why fewer modes made it better."
date: 2026-10-24
---

The [Dark Mode demo](/demos/dark-mode/) shows the basic pattern: CSS variables, a `data-theme` attribute on `<html>`, and a tiny script in `<head>` so the page never flashes the wrong theme. When I redesigned vranjan.dev, I kept that core and threw out most of what I'd piled on top of it.

## What it used to be

The old site had four looks: dark, light, high contrast and a green-on-black "terminal" mode. High contrast and terminal were classes that overrode the theme variables with `!important`, so every new component had to be checked in four states, and terminal mode needed its own animations on top of that.

The toggle itself was a floating button in the bottom-left corner that only faded in after you scrolled 100px, and it hid itself completely on the contact page. All of that logic lived in `{% raw %}{% set js %}{% endraw %}` blocks inside Nunjucks templates, which no linter or formatter could see.

## The flicker I had first

Before any of that, the site had the classic bug: pick light mode, click to another page, and the new page flashes dark for a moment before turning light. It happened on every navigation.

The cause was where and when the theme got applied. The toggle's script put a `light-theme` class on `<body>`, inside a `DOMContentLoaded` handler:

```js
document.addEventListener("DOMContentLoaded", () => {
    const pref = localStorage.getItem("light-mode");
    document.body.classList.toggle("light-theme", pref === "enabled");
});
```

`DOMContentLoaded` fires after the browser has parsed the page, and by then it has usually painted it already in the default dark theme. The class arrives a frame or two later and the page visibly switches. Running the same code earlier wasn't enough on its own either, because `<body>` doesn't exist yet while the browser is still reading `<head>`.

The fix has three parts, and they're what the init script below does:

1. **Set the theme on `<html>`, not `<body>`.** `document.documentElement` exists from the very first script, so the attribute can be set before anything renders.
2. **Run it inline, first thing in `<head>`.** Not deferred, not in an external file, not behind any event. It has to sit above the stylesheet link, so the very first paint already uses the right variables.
3. **Switch off colour transitions until the page has loaded.** If `background-color` has a transition, even a correctly timed theme can visibly fade in from the default. A `no-transition` class blocks that and is removed after `load`.

If the flicker ever comes back, it's easy to check for. Open DevTools, set CPU throttling to 6× in the Performance panel, record while clicking between pages in the non-default theme, and look through the screenshot strip. Any frame in the wrong theme means something is setting the theme too late, usually a script that has moved below the stylesheet, become `defer`/`async`, or ended up behind an event listener.

## What it is now

**Two themes, defined once each.** The palettes are two Sass mixins. Dark is the default on `:root`, and light switches in with the attribute:

```scss
@mixin theme-dark {
    color-scheme: dark;
    --color-bg-primary: #{$dark-bg-primary};
    --color-text-primary: #{$dark-text-primary};
    // ...every semantic token
}

@mixin theme-light {
    color-scheme: light;
    --color-bg-primary: #{$light-bg-primary};
    --color-text-primary: #{$light-text-primary};
    // ...the same tokens, light values
}

:root,
html[data-theme="dark"] {
    @include theme-dark;
}

html[data-theme="light"] {
    @include theme-light;
}
```

The rule that makes this hold up: literal colours exist only in one tokens file, and every component uses the semantic variables. Adding a variable means adding it to both mixins, and that's the only thing you have to remember.

`color-scheme` matters more than it looks. It's what tells the browser to draw scrollbars, form controls and autofill in the matching theme.

**The init script picks a theme before anything paints.** It runs inline in `<head>`, checks the saved choice, then the OS setting:

```js
const getTheme = () => {
    try {
        const stored = localStorage.getItem("theme");
        if (stored === "light" || stored === "dark") return stored;

        // an older version stored this under a different key
        const legacy = localStorage.getItem("light-mode");
        if (legacy === "enabled") return "light";
        if (legacy === "disabled") return "dark";
    } catch {}

    return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

document.documentElement.setAttribute("data-theme", getTheme());
```

The same script also adds the `no-transition` class from the flicker fix, so colours only animate when you switch themes, never on page load.

One detail I'd skipped the first time round: **old preferences need cleaning up.** Returning visitors still had `contrastEnabled` and `terminalEnabled` saved from the old site. The init script deletes those keys, so nobody gets stuck in a mode that no longer exists.

**Reduced motion is a separate setting, not a theme.** It's a class on `<html>` that turns animations and transitions off, so it works the same in both themes instead of being one more mode to design.

**The toggle is a plain header button.** It's always in the same place on every page, at every screen size, and the script behind it just flips the attribute and saves the choice. The site's JavaScript now lives in ordinary `.js` files that ESLint and Prettier check, and a filter inlines them into the page at build time, so it still ships without an extra request.

## Making third-party widgets follow along

Anything inside an iframe ignores your CSS variables. The contact form's reCAPTCHA widget is the obvious example: it only comes in Google's own light or dark style, picked when it's drawn.

So the contact script watches the attribute and redraws the widget when it changes:

```js
const currentTheme = () => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

new MutationObserver(renderCaptcha).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
});
```

`renderCaptcha` creates a fresh container and calls `grecaptcha.render()` with `theme: currentTheme()`. Google can't restyle a widget that's already drawn, so switching themes clears the tick and the visitor ticks it again. That's a fair trade for a form that doesn't have a bright white box in the middle of a dark page.

The same pattern works for any embed that takes a theme option: watch `data-theme`, and re-render or send it a message when it changes.

## What I took from it

Every extra mode costs you on every component you build after it. Two well-defined themes, a reduced-motion setting that's independent of them, and one attribute everything else can watch gave me a toggle that works everywhere, including the page the old one used to hide on.
