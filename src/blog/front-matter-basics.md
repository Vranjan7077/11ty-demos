---
title: "Front matter is just data"
description: "It looks like config, but it's really just a YAML object attached to your file."
date: 2026-02-08
---

Front matter trips people up because it looks like configuration syntax. It's not. It's just a YAML (or JSON, or JS) object that Eleventy reads off the top of your file and merges into everything else it knows about that page.

That's why directory data files work the way they do. `demos.json` sitting next to a folder of `.md` files isn't magic, it's just more data getting merged in before your own front matter gets a turn. Once that clicks, most of Eleventy's data cascade stops feeling clever and starts feeling obvious.
