import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";

import demos from "../src/_11ty/collections/demos.js";
import demoTags from "../src/_11ty/collections/demoTags.js";
import posts from "../src/_11ty/collections/posts.js";
import recentActivity from "../src/_11ty/collections/recentActivity.js";
import codeFile from "../src/_11ty/shortcodes/codeFile.js";
import htmlmin from "../src/_11ty/transforms/htmlmin.js";
import { inlineScriptHashes, buildPolicy } from "../src/_11ty/csp.js";
import { fingerprintFiles } from "../src/_11ty/fingerprint.js";
import { lastCommitDate } from "../src/_11ty/gitDates.js";
import { readPreferences, writePreference, isEnabled, STORAGE_KEY } from "../src/assets/js/preferences.js";
import { shouldIncludeDrafts, isDraft, findDrafts, draftUrl } from "../src/_11ty/drafts.js";

function fakeCollectionApi(byGlob) {
    return { getFilteredByGlob: (glob) => [...(byGlob[glob] || [])] };
}

const item = (title, data = {}) => ({ url: `/${title}/`, date: data.date, data: { title, ...data } });

test("demos collection sorts by order, then title, with unordered demos last", () => {
    const api = fakeCollectionApi({
        "src/demos/*.md": [item("Zeta"), item("Beta", { order: 20 }), item("Alpha"), item("Gamma", { order: 10 })],
    });
    assert.deepEqual(
        demos(api).map((d) => d.data.title),
        ["Gamma", "Beta", "Alpha", "Zeta"]
    );
});

test("demoTags is sorted, de-duplicated, and excludes the shared demo tag", () => {
    const api = fakeCollectionApi({
        "src/demos/*.md": [
            item("A", { tags: ["demo", "css", "data"] }),
            item("B", { tags: ["demo", "css"] }),
            item("C"),
        ],
    });
    assert.deepEqual(demoTags(api), ["css", "data"]);
});

test("posts and recentActivity are newest first", () => {
    const older = item("older", { date: new Date("2026-01-01") });
    older.date = older.data.date;
    const newer = item("newer", { date: new Date("2026-03-01") });
    newer.date = newer.data.date;
    const middle = item("demo", { date: new Date("2026-02-01") });
    middle.date = middle.data.date;
    const api = fakeCollectionApi({ "src/blog/*.md": [older, newer], "src/demos/*.md": [middle] });

    assert.deepEqual(
        posts(api).map((p) => p.data.title),
        ["newer", "older"]
    );
    assert.deepEqual(
        recentActivity(api).map((p) => p.data.title),
        ["newer", "demo", "older"]
    );
});

const fenceBody = (output) => output.split("```")[1].split("\n").slice(1, -1).join("\n");

test("codeFile with a line range returns exactly those lines", () => {
    assert.equal(fenceBody(codeFile("src/_11ty/filters/limit.js", 2, 2)), "    return arr.slice(0, n);");
});

test("codeFile with a single start line returns just that line", () => {
    assert.equal(fenceBody(codeFile("src/_11ty/filters/limit.js", 1)), "export default function limit(arr = [], n) {");
});

test("codeFile with a string returns every line containing it", () => {
    const body = fenceBody(codeFile("eleventy.config.js", "pluginSyntaxHighlight"));
    const lines = body.split("\n");
    assert.equal(lines.length, 2);
    assert.ok(lines.every((line) => line.includes("pluginSyntaxHighlight")));
});

test("codeFile throws when a search string matches nothing", () => {
    assert.throws(() => codeFile("eleventy.config.js", "definitely-not-in-this-file"), /no line/);
});

test("codeFile labels the fence with the right language", () => {
    assert.match(codeFile("src/tags.njk"), /```markup\n/);
    assert.match(codeFile("src/_data/lighthouseScores.json"), /```json\n/);
});

test("line ranges embedded by the Accessibility demo still point at the intended code", () => {
    const skipLink = fenceBody(codeFile("src/assets/scss/layout/_grid.scss", 24, 39)).split("\n");
    assert.equal(skipLink[0], ".skip-link {");
    assert.equal(skipLink.at(-1).trim(), "}");
    assert.ok(skipLink.some((line) => line.includes("&:focus")));

    const mixin = fenceBody(codeFile("src/assets/scss/abstracts/_mixins.scss", 14, 24)).split("\n");
    assert.equal(mixin[0], "@mixin visually-hidden {");
    assert.equal(mixin.at(-1), "}");
});

test("htmlmin minifies HTML output", async () => {
    const html = "<!DOCTYPE html>\n<html>\n  <body>\n    <!-- note -->\n    <p>  Hello  </p>\n  </body>\n</html>";
    const output = await htmlmin(html, "public/index.html");
    assert.ok(output.length < html.length);
    assert.ok(!output.includes("note"));
});

test("htmlmin leaves non-HTML output untouched", async () => {
    const xml = "<feed>\n  <title>x</title>\n</feed>";
    assert.equal(await htmlmin(xml, "public/feed.xml"), xml);
    assert.equal(await htmlmin(xml, false), xml);
});

test("inlineScriptHashes hashes executable inline scripts only", () => {
    const html = `
        <script>var a = 1;</script>
        <script type="module">import "./x.js";</script>
        <script src="/main.js"></script>
        <script type="application/ld+json">{"@type":"Thing"}</script>
        <script>   </script>`;
    const expected = ["var a = 1;", 'import "./x.js";'].map(
        (body) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`
    );
    assert.deepEqual([...inlineScriptHashes(html)].sort(), expected.sort());
});

test("buildPolicy allows only self plus the given script hashes", () => {
    const policy = buildPolicy(new Set(["'sha256-abc='"]));
    assert.match(policy, /script-src 'self' 'wasm-unsafe-eval' 'sha256-abc='/);
    assert.match(policy, /frame-ancestors 'none'/);
    assert.doesNotMatch(policy, /unsafe-inline/);
});

test("fingerprintFiles is stable for the same inputs and changes with extra input", () => {
    const first = fingerprintFiles("src/_11ty/filters/*.js");
    assert.equal(first, fingerprintFiles("src/_11ty/filters/*.js"));
    assert.match(first, /^[0-9a-f]{10}$/);
    assert.notEqual(first, fingerprintFiles("src/_11ty/filters/*.js", "sass 2.0"));
});

test("fingerprintFiles fails loudly when nothing matches", () => {
    assert.throws(() => fingerprintFiles("does/not/exist/*.css"), /nothing matched/);
});

test("lastCommitDate returns null for untracked files and an ISO date for tracked ones", () => {
    assert.equal(lastCommitDate("does/not/exist.md"), null);
    const date = lastCommitDate("package.json");
    if (date !== null) assert.match(date, /^\d{4}-\d{2}-\d{2}T/);
});

function fakeStorage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        data,
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: (key) => data.delete(key),
    };
}

test("reader preferences default to everything on and store nothing", () => {
    const storage = fakeStorage();
    const preferences = readPreferences(storage);
    assert.equal(isEnabled(preferences, "css"), true);
    assert.equal(isEnabled(preferences, "webFonts"), true);
    assert.equal(storage.data.size, 0);
});

test("reader preferences store only what's turned off, and clear the key when all are back on", () => {
    const storage = fakeStorage();
    writePreference("webFonts", false, storage);
    writePreference("css", false, storage);
    assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), { webFonts: false, css: false });

    writePreference("css", true, storage);
    assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), { webFonts: false });

    writePreference("webFonts", true, storage);
    assert.equal(storage.getItem(STORAGE_KEY), null);
});

test("reader preferences survive corrupt or unexpected stored values", () => {
    for (const bad of ["not json", "[1,2]", "null", "42"]) {
        assert.deepEqual(readPreferences(fakeStorage({ [STORAGE_KEY]: bad })), {}, bad);
    }
});

test("reader preferences don't throw when storage is unavailable", () => {
    const throwing = {
        getItem() {
            throw new Error("blocked");
        },
        setItem() {
            throw new Error("blocked");
        },
        removeItem() {
            throw new Error("blocked");
        },
    };
    assert.deepEqual(readPreferences(throwing), {});
    assert.doesNotThrow(() => writePreference("css", false, throwing));
});

test("the head scripts and the toggle script agree on the storage key and preference names", () => {
    const headScripts = {
        webFonts: fs.readFileSync("src/_includes/components/preferences-init.njk", "utf8"),
        css: fs.readFileSync("src/_includes/components/css-preference-init.njk", "utf8"),
    };
    const component = fs.readFileSync("src/_includes/components/reader-toggles.njk", "utf8");
    for (const [name, script] of Object.entries(headScripts)) {
        assert.ok(script.includes(`"${STORAGE_KEY}"`), name);
        assert.match(script, new RegExp(`prefs\\.${name} [!=]== false`), name);
        assert.ok(component.includes(`data-reader-toggle="${name}"`), name);
    }
});

test("the font preload points at the same file as the @font-face rule", () => {
    const head = fs.readFileSync("src/_includes/components/preferences-init.njk", "utf8");
    const fonts = fs.readFileSync("src/assets/scss/base/_fonts.scss", "utf8");
    const preloaded = head.match(/preload\.href = "([^"]+)"/)[1];
    assert.ok(fonts.includes(`url("${preloaded}")`));
    assert.ok(fs.existsSync(`src${preloaded}`));
});

test("drafts are included while serving, excluded from builds, and re-included when INCLUDE_DRAFTS is set", () => {
    assert.equal(shouldIncludeDrafts({ ELEVENTY_RUN_MODE: "serve" }), true);
    assert.equal(shouldIncludeDrafts({ ELEVENTY_RUN_MODE: "watch" }), true);
    assert.equal(shouldIncludeDrafts({ ELEVENTY_RUN_MODE: "build" }), false);
    assert.equal(shouldIncludeDrafts({ ELEVENTY_RUN_MODE: "build", INCLUDE_DRAFTS: "true" }), true);
    assert.equal(shouldIncludeDrafts({ ELEVENTY_RUN_MODE: "build", INCLUDE_DRAFTS: "1" }), false);
});

test("isDraft only reads draft: true from the front matter itself", () => {
    assert.equal(isDraft("---\ntitle: x\ndraft: true\n---\nbody"), true);
    assert.equal(isDraft("---\r\ntitle: x\r\ndraft: true\r\n---\r\nbody"), true);
    assert.equal(isDraft("---\ntitle: x\ndraft: false\n---\nbody"), false);
    assert.equal(isDraft("---\ntitle: x\n---\n\ndraft: true\n"), false);
    assert.equal(isDraft("no front matter"), false);
});

test("findDrafts lists the real draft with its title and future URL", () => {
    const drafts = findDrafts();
    const draft = drafts.find((d) => d.file === "src/blog/drafts-stay-out-of-production.md");
    assert.deepEqual(draft, {
        file: "src/blog/drafts-stay-out-of-production.md",
        title: "This post is a draft",
        url: "/blog/drafts-stay-out-of-production/",
    });
    assert.equal(draftUrl("src/demos/x.md"), "/demos/x/");
    assert.equal(draftUrl("src/about.md"), null);
});
