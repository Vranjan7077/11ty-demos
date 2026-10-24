import { test } from "node:test";
import assert from "node:assert/strict";

import pluralize from "../src/_11ty/filters/pluralize.js";
import excerpt from "../src/_11ty/filters/excerpt.js";
import formatNumber from "../src/_11ty/filters/formatNumber.js";
import timeAgo from "../src/_11ty/filters/timeAgo.js";
import toJson from "../src/_11ty/filters/toJson.js";
import jsonLd from "../src/_11ty/filters/jsonLd.js";
import demosToItemList from "../src/_11ty/filters/demosToItemList.js";
import relatedDemos from "../src/_11ty/filters/relatedDemos.js";
import siblings from "../src/_11ty/filters/siblings.js";
import toc from "../src/_11ty/filters/toc.js";
import byTag from "../src/_11ty/filters/byTag.js";
import limit from "../src/_11ty/filters/limit.js";
import htmlDateString from "../src/_11ty/filters/htmlDateString.js";
import repoUrl from "../src/_11ty/filters/repoUrl.js";
import assetUrl from "../src/_11ty/filters/assetUrl.js";
import readableDateTime from "../src/_11ty/filters/readableDateTime.js";

test("pluralize uses the singular form for exactly one", () => {
    assert.equal(pluralize(1, "demo"), "1 demo");
});

test("pluralize adds an s by default for anything else", () => {
    assert.equal(pluralize(0, "demo"), "0 demos");
    assert.equal(pluralize(3, "demo"), "3 demos");
});

test("pluralize uses an explicit plural when given one", () => {
    assert.equal(pluralize(2, "story", "stories"), "2 stories");
});

test("excerpt returns short text unchanged", () => {
    assert.equal(excerpt("short text", 20), "short text");
});

test("excerpt truncates long text with an ellipsis", () => {
    const text = "one two three four five six seven";
    assert.equal(excerpt(text, 3), "one two three…");
});

test("formatNumber adds thousands separators", () => {
    assert.equal(formatNumber(1234567), "1,234,567");
});

test("formatNumber leaves small numbers unchanged", () => {
    assert.equal(formatNumber(42), "42");
});

test("timeAgo reports today for the current moment", () => {
    assert.equal(timeAgo(new Date()), "today");
});

test("timeAgo reports a pluralized unit for the past", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    assert.equal(timeAgo(threeDaysAgo), "3 days ago");
});

test("timeAgo uses the singular form for exactly one unit", () => {
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    assert.equal(timeAgo(oneDayAgo), "1 day ago");
});

test("toJson produces indented, parseable JSON", () => {
    const output = toJson({ a: 1 });
    assert.equal(JSON.parse(output).a, 1);
    assert.match(output, /\n/);
});

test("jsonLd produces parseable JSON", () => {
    const output = jsonLd({ headline: "Test" });
    assert.deepEqual(JSON.parse(output), { headline: "Test" });
});

test("jsonLd escapes < so </script> can never appear literally", () => {
    const output = jsonLd({ title: "</script><script>alert(1)</script>" });
    assert.equal(output.includes("</script>"), false);
    assert.equal(JSON.parse(output).title, "</script><script>alert(1)</script>");
});

test("demosToItemList builds real ListItem entries with correct positions", () => {
    const demos = [
        { url: "/demos/a/", data: { title: "A" } },
        { url: "/demos/b/", data: { title: "B" } },
    ];
    const list = demosToItemList(demos, "https://example.com");
    assert.deepEqual(list, [
        { "@type": "ListItem", position: 1, url: "https://example.com/demos/a/", name: "A" },
        { "@type": "ListItem", position: 2, url: "https://example.com/demos/b/", name: "B" },
    ]);
});

const demo = (slug, tags) => ({ url: `/demos/${slug}/`, data: { title: slug, tags: ["demo", ...tags] } });

test("relatedDemos ranks by shared tags, skips the current page, and ignores the shared demo tag", () => {
    const all = [
        demo("current", ["css", "javascript"]),
        demo("one-shared", ["css"]),
        demo("two-shared", ["css", "javascript"]),
        demo("only-demo-tag", []),
    ];
    const related = relatedDemos(all, "/demos/current/", ["demo", "css", "javascript"], 3);
    assert.deepEqual(
        related.map((d) => d.data.title),
        ["two-shared", "one-shared"]
    );
});

test("relatedDemos respects the limit", () => {
    const all = [demo("a", ["x"]), demo("b", ["x"]), demo("c", ["x"])];
    assert.equal(relatedDemos(all, "/elsewhere/", ["x"], 2).length, 2);
});

test("siblings returns null at both ends and for an unknown url", () => {
    const items = [{ url: "/a/" }, { url: "/b/" }, { url: "/c/" }];
    assert.deepEqual(siblings(items, "/a/"), { prev: null, next: items[1] });
    assert.deepEqual(siblings(items, "/c/"), { prev: items[1], next: null });
    assert.deepEqual(siblings(items, "/missing/"), { prev: null, next: null });
});

test("toc collects h2 and h3 headings with ids and strips markup inside them", () => {
    const html = `
        <h1 id="title">Title</h1>
        <h2 id="how-it-works">How <code>it</code> works</h2>
        <h3 class="x" id="details">Details</h3>
        <h4 id="too-deep">Too deep</h4>
        <h2>No id</h2>`;
    assert.deepEqual(toc(html), [
        { level: 2, id: "how-it-works", text: "How it works" },
        { level: 3, id: "details", text: "Details" },
    ]);
});

test("toc returns an empty list for empty content", () => {
    assert.deepEqual(toc(), []);
});

test("byTag keeps only items carrying the tag, and tolerates missing tags", () => {
    const items = [demo("a", ["css"]), demo("b", ["js"]), { url: "/c/", data: {} }];
    assert.deepEqual(
        byTag(items, "css").map((d) => d.url),
        ["/demos/a/"]
    );
});

test("limit returns at most n items", () => {
    assert.deepEqual(limit([1, 2, 3], 2), [1, 2]);
    assert.deepEqual(limit(undefined, 2), []);
});

test("htmlDateString formats a date as YYYY-MM-DD in UTC", () => {
    assert.equal(htmlDateString(new Date("2026-02-21T00:00:00Z")), "2026-02-21");
});

test("repoUrl links a repo-relative path to the file on GitHub", () => {
    assert.equal(
        repoUrl("./src/demos/rss.md"),
        "https://github.com/Vranjan7077/11ty-demos/blob/master/src/demos/rss.md"
    );
});

test("assetUrl refuses URLs it can't fingerprint instead of emitting an unversioned link", () => {
    assert.throws(() => assetUrl("/assets/js/unknown.js"), /no fingerprint source/);
});

test("readableDateTime shows the date and time in UTC", () => {
    assert.equal(readableDateTime("2026-10-24T01:30:00Z"), "October 24, 2026 at 01:30 UTC");
});
