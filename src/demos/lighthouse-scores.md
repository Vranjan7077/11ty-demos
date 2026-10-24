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

- The scores above come from Google's PageSpeed Insights running against the live site, mobile strategy, fetched by the Action every Sunday. "Last refreshed" is the moment that run happened, and the relative time next to it is worked out in your browser, so it can't go stale between builds.
- This needs a `PAGESPEED_API_KEY` repository secret to actually run. Without it, the Action fails loudly (`exit 1`) rather than silently leaving stale data.
- Each run writes a new `fetchedAt`, so it always commits, and Netlify deploys that commit like any other push. Commits made with the workflow's own `GITHUB_TOKEN` don't start other GitHub workflows, so the commit can't set off a chain of runs.
- The JSON is written with four-space indentation and a trailing newline, exactly what Prettier would produce, so the bot's commits never fail the formatting check in CI.
- Refreshing the scores is separate from {% demoLink "scheduled-rebuilds", "Scheduled Rebuilds" %}: the daily rebuild refreshes everything else fetched at build time, but only this weekly job asks PageSpeed for new numbers.
