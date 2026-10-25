import { test } from "node:test";
import assert from "node:assert/strict";

import { escapeXml, wrapText, cardSvg, renderCard, WIDTH, HEIGHT } from "../src/_11ty/og-images/generate.js";
import { cardHash, cardInputs } from "../src/_11ty/shortcodes/ogImage.js";
import ogImageUrl from "../src/_11ty/filters/ogImageUrl.js";

const charWidth = (text) => text.length;
const pngSize = (png) => ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) });

test("escapeXml escapes every character that could break the SVG", () => {
    assert.equal(
        escapeXml(`<a href="x">Tom & 'Jerry'</a>`),
        "&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;"
    );
});

test("wrapText fills lines up to the width without splitting words", () => {
    assert.deepEqual(wrapText("one two three four", 9, 3, charWidth), ["one two", "three", "four"]);
});

test("wrapText ends with an ellipsis at a word boundary when text is too long", () => {
    const lines = wrapText("alpha beta gamma delta epsilon zeta eta theta", 11, 2, charWidth);
    assert.equal(lines.length, 2);
    assert.ok(lines[1].endsWith("…"));
    assert.ok(lines.every((line) => charWidth(line) <= 12));
});

test("wrapText returns nothing for empty text", () => {
    assert.deepEqual(wrapText("   ", 100, 3, charWidth), []);
});

test("cardSvg escapes page text and only embeds a thumbnail when there is one", () => {
    const base = {
        title: "A <b>bold</b> title",
        description: "Fish & chips",
        eyebrow: "Blog post",
        siteName: "11ty Demos",
        siteHost: "example.com",
    };
    const plain = cardSvg(base, charWidth);
    assert.ok(plain.includes("A &lt;b&gt;bold&lt;/b&gt; title"));
    assert.ok(plain.includes("Fish &amp; chips"));
    assert.ok(plain.includes("BLOG POST"));
    assert.ok(!plain.includes("<image"));
    assert.ok(cardSvg({ ...base, thumbnailSvg: "<svg/>" }, charWidth).includes("<image"));
});

test("renderCard produces a 1200×630 PNG", () => {
    const png = renderCard(
        cardInputs({ title: "Test card", description: "Rendered by a unit test.", eyebrow: "Test" })
    );
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.deepEqual(pngSize(png), { width: WIDTH, height: HEIGHT });
});

test("cardHash is stable for the same inputs and changes when any of them change", () => {
    const inputs = cardInputs({ title: "Same", description: "Same", eyebrow: "Same" });
    assert.equal(cardHash(inputs), cardHash(cardInputs({ title: "Same", description: "Same", eyebrow: "Same" })));
    assert.notEqual(cardHash(inputs), cardHash({ ...inputs, title: "Different" }));
    assert.notEqual(cardHash(inputs), cardHash({ ...inputs, eyebrow: "Different" }));
    assert.match(cardHash(inputs), /^[0-9a-f]{12}$/);
});

test("a demo's thumbnail is part of its card, and a missing or non-SVG thumbnail is skipped", () => {
    assert.ok(
        cardInputs({ title: "x", thumbnail: "/assets/images/demos/dark-mode.svg" }).thumbnailSvg.startsWith("<svg")
    );
    assert.equal(cardInputs({ title: "x", thumbnail: "/assets/images/demos/missing.svg" }).thumbnailSvg, null);
    assert.equal(cardInputs({ title: "x", thumbnail: "/assets/images/og-default.png" }).thumbnailSvg, null);
});

test("the ogImageUrl filter points at the file the ogImage shortcode writes", () => {
    const card = {
        title: "Dark Mode",
        description: "A description",
        eyebrow: "Beginner demo",
        thumbnail: "/assets/images/demos/dark-mode.svg",
    };
    assert.equal(
        ogImageUrl(card.title, card.description, card.eyebrow, card.thumbnail),
        `/assets/images/og/${cardHash(cardInputs(card))}.png`
    );
});
