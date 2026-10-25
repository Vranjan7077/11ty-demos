---
title: "Scheduled Rebuilds"
description: "Rebuild the static site every day from a GitHub Actions cron job, so data fetched at build time never goes stale."
tags: ["netlify", "data", "performance"]
date: 2026-10-24
difficulty: "Beginner"
thumbnail: /assets/images/demos/scheduled-rebuilds.svg
order: 114
demoBlock: "demo-live/scheduled-rebuilds.njk"
---

## How It Works

A static site is a snapshot. Everything that's fetched or computed at build time is frozen until the next build: the {% demoLink "lighthouse-scores", "Lighthouse scores" %}, the {% demoLink "image-gallery", "Pexels photos" %}, each demo's "Updated" date, the {% demoLink "unit-tests", "test results" %}. If nobody pushes for a month, the site quietly shows month-old data.

The fix is to rebuild on a schedule, even when nothing in the repo has changed. Netlify gives every site **build hooks**: secret URLs that start a fresh build of the latest commit when anything `POST`s to them. A GitHub Actions workflow with a `schedule` trigger does the posting once a day:

```yaml
on:
    schedule:
        - cron: "30 1 * * *"
```

`30 1 * * *` means 01:30 UTC every day ([crontab.guru](https://crontab.guru/#30_1_*_*_*) explains the five fields). The job itself is a single `curl` to the hook URL, which lives in a repository secret rather than in the code, since anyone who has it can trigger builds. The `trigger_title` query parameter labels the deploy, so scheduled builds are easy to spot in Netlify's deploy list.

The Live Implementation above is a small data file, `build.js`, that records the build time plus a few environment variables Netlify sets during every build: `CONTEXT` (production, deploy preview, or branch deploy), `COMMIT_REF`, and `INCOMING_HOOK_TITLE`, which is only set when a build hook started the build.

## Setting it up

1. In Netlify: **Site configuration → Build & deploy → Build hooks → Add build hook**, name it something like "Daily rebuild", and copy the URL.
2. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**, named `NETLIFY_BUILD_HOOK_URL`.
3. Run the workflow once by hand (**Actions → Scheduled Netlify Rebuild → Run workflow**) and check that a new deploy appears in Netlify.

Until the secret exists, the workflow logs a warning and exits successfully instead of failing, so an unconfigured fork doesn't email a failure notice every morning.

## Folder Structure

```text
.github/workflows/scheduled-rebuild.yml      ← the daily cron + curl
src/_data/build.js                           ← build time, context, commit, hook name
src/_includes/demo-live/scheduled-rebuilds.njk
```

## Important Files

{% codeFile ".github/workflows/scheduled-rebuild.yml" %}

{% codeFile "src/_data/build.js" %}

## Notes

- GitHub runs scheduled workflows on a best-effort basis, so a run can start several minutes late at busy times. Don't schedule anything that needs to happen at an exact minute.
- GitHub turns scheduled workflows off in a public repository after 60 days without any repository activity, and sends a notice when it does. A commit or re-enabling the workflow in the Actions tab turns it back on.
- Each scheduled run is a full Netlify build, so it uses build minutes from your plan every day. Daily is plenty for data that changes daily or weekly.
- Netlify can also do this without GitHub, from a Netlify scheduled function that calls the same hook. The GitHub version keeps the schedule visible right next to the other workflows, and it's easy to run by hand.
