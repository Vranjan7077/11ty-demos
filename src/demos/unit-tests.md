---
title: "Unit Tests"
description: "Real tests for this site's pure filters, run live at build time and gating every real pull request."
tags: ["javascript", "data"]
date: 2026-07-22
difficulty: "Intermediate"
thumbnail: /assets/images/demos/unit-tests.svg
order: 110
demoBlock: "demo-live/unit-tests.njk"
---

## How It Works

Every filter this site adds a demo for — `pluralize`, `excerpt`, `formatNumber`, `timeAgo`, `toJson`, `jsonLd`, `demosToItemList` — is a small, pure function: same input, same output, no Eleventy, no DOM, nothing to mock. That's exactly the shape Node's own built-in test runner wants, so this site uses it directly instead of adding a testing framework as a dependency:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import pluralize from "../src/_11ty/filters/pluralize.js";

test("pluralize uses the singular form for exactly one", () => {
    assert.equal(pluralize(1, "demo"), "1 demo");
});
```

`node --test` finds and runs every `*.test.js` file under `test/` with zero configuration. No dependency was added for this — `node:test` and `node:assert` have shipped inside Node itself since version 18.

## Making the results actually live

Most sites would stop at "there's a test suite." This one goes one step further: a global data file runs the real suite, programmatically, at the exact moment this page builds, using the same `node:test` module's `run()` function instead of shelling out to a CLI:

```js
import { run } from "node:test";

const stream = run({ files: [testFile] });
for await (const event of stream) {
    if (event.type === "test:pass") pass++;
    if (event.type === "test:fail") fail++;
}
```

The numbers in the Live Implementation above aren't written by hand anywhere — they're the actual result of actually running the actual tests, for this actual build. If a test ever failed, this page would show that failure the next time it built, not a stale "✔ all passing" someone forgot to update.

## Folder Structure

```text
test/filters.test.js       ← the real tests
src/_data/testResults.js   ← runs them at build time, feeds this page
.github/workflows/lighthouse-ci.yml ← runs npm test on every real pull request
```

## Important Files

{% codeFile "test/filters.test.js" %}

{% codeFile "src/_data/testResults.js" %}

## Notes

- These tests run in the real GitHub Actions workflow that gates pull requests, before the site even builds — a broken filter fails the check, it doesn't just sit unnoticed in a `test/` folder nobody runs.
- Writing these caught a real mistake: an early version of the `pluralize` test asserted `pluralize(0, "demo")` should return `"0 demo"`. The actual function was already correct — zero is not one, so it correctly pluralizes to `"0 demos"` — the test itself had the bug. That's the whole point of a test: it doesn't know which side is wrong until you look.
