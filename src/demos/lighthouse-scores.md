---
title: "Live Lighthouse Scores"
description: "Real Lighthouse scores rendered as static badges, refreshed weekly by a scheduled GitHub Action, no client-side API calls."
tags: ["performance", "data", "plugins"]
date: 2026-07-22
difficulty: "Intermediate"
thumbnail: /assets/images/demos/lighthouse-scores.svg
order: 96
demoBlock: "demo-live/lighthouse-scores.njk"
---

## How It Works

There's a tempting shortcut here: call the PageSpeed Insights API from the browser and render the scores live. Don't. That means exposing an API key client-side, and a Lighthouse run takes several seconds, so every visitor would sit there waiting on a score nobody asked them to wait for.

Instead, this runs on a schedule, not a page load. A GitHub Action fires weekly, hits Google's PageSpeed Insights API server-side (where the key can stay a secret), and writes the result straight into the repo as a committed JSON file:

```yaml
- name: Fetch PageSpeed scores
  env:
      PAGESPEED_API_KEY: ${{ secrets.PAGESPEED_API_KEY }}
  run: |
      RESPONSE=$(curl -sf -G "https://www.googleapis.com/pagespeedonline/v5/runPagespeed" \
        --data-urlencode "url=https://11ty-demos.netlify.app/" \
        --data-urlencode "key=${PAGESPEED_API_KEY}" \
        --data-urlencode "strategy=mobile")
      # ...parses the response, writes src/_data/lighthouseScores.json
- name: Commit updated scores
  run: |
      git add src/_data/lighthouseScores.json
      git commit -m "chore: update lighthouse scores"
      git push
```

From there it's just an Eleventy global data file. `src/_data/lighthouse.js` reads the committed JSON, and every page that wants the badges just asks for `lighthouse.categories`. No fetch, no loading state, no exposed key — by the time anyone sees the page, the data's already been sitting in the repo for up to a week.

## Folder Structure

```text
.github/workflows/update-lighthouse-scores.yml ← the weekly cron job
src/_data/lighthouseScores.json                 ← committed by that job
src/_data/lighthouse.js                          ← thin data wrapper
src/_includes/components/lighthouse-scores.njk   ← the badge macro
```

## Important Files

{% codeFile "src/_data/lighthouse.js" %}

{% codeFile "src/_includes/components/lighthouse-scores.njk" %}

## Notes

- The scores above are genuinely real — captured from a full local Lighthouse audit of this site during development, not placeholder numbers. Once this repo is deployed and the weekly Action has run at least once against the live URL, they'll refresh automatically.
- This needs a `PAGESPEED_API_KEY` repository secret to actually run. Without it, the Action fails loudly (`exit 1`) rather than silently leaving stale data.
- This runs on its own weekly schedule, completely independent of when the site itself gets rebuilt or deployed. A deploy doesn't refresh the scores, and a scheduled score refresh doesn't trigger a deploy on its own (it does trigger a rebuild, since Netlify watches the repo and this workflow pushes a commit).
