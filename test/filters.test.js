import { test } from "node:test";
import assert from "node:assert/strict";

import pluralize from "../src/_11ty/filters/pluralize.js";
import excerpt from "../src/_11ty/filters/excerpt.js";
import formatNumber from "../src/_11ty/filters/formatNumber.js";
import timeAgo from "../src/_11ty/filters/timeAgo.js";
import toJson from "../src/_11ty/filters/toJson.js";
import jsonLd from "../src/_11ty/filters/jsonLd.js";
import demosToItemList from "../src/_11ty/filters/demosToItemList.js";

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
