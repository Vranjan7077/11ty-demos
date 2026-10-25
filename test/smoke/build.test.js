import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";

import site from "../../src/_data/site.js";
import { inlineScriptHashes } from "../../src/_11ty/csp.js";
import { fingerprintFiles } from "../../src/_11ty/fingerprint.js";
import { findDrafts } from "../../src/_11ty/drafts.js";

const OUT = "public";
const DRAFTS = findDrafts();
const DRAFT_FILES = new Set(DRAFTS.map((draft) => draft.file));
const INTENTIONALLY_MISSING = new Set(["/this-page-does-not-exist/", ...DRAFTS.map((draft) => draft.url)]);
const RUNTIME_ONLY_PREFIXES = ["/.netlify/functions/"];

const pages = new Map();

const read = (file) => fs.readFileSync(path.join(OUT, file), "utf8");
const exists = (file) => fs.existsSync(path.join(OUT, file));

function stripNonMarkup(html) {
    return html
        .replace(/<pre\b[\s\S]*?<\/pre>/gi, "")
        .replace(/<code\b[\s\S]*?<\/code>/gi, "")
        .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, "<script$1></script>");
}

function attributeValues(html, name) {
    return [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "g"))].map((match) => match[1]);
}

function idsOf(html) {
    return attributeValues(stripNonMarkup(html), "id");
}

function pageFileForUrl(urlPath) {
    const decoded = decodeURIComponent(urlPath);
    if (decoded.endsWith("/")) return exists(`${decoded.slice(1)}index.html`) ? `${decoded.slice(1)}index.html` : null;
    if (exists(decoded.slice(1)) && fs.statSync(path.join(OUT, decoded)).isFile()) return decoded.slice(1);
    if (exists(`${decoded.slice(1)}/index.html`)) return `${decoded.slice(1)}/index.html`;
    return null;
}

function internalReferences(html) {
    const markup = stripNonMarkup(html);
    const urls = [...attributeValues(markup, "href"), ...attributeValues(markup, "src")];
    for (const srcset of attributeValues(markup, "srcset")) {
        urls.push(...srcset.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]));
    }
    return urls.filter((url) => url.startsWith("/") && !url.startsWith("//"));
}

function assertWellFormedXml(xml, label) {
    const body = xml.replace(/^\s*<\?xml[^>]*\?>/, "").replace(/<!--[\s\S]*?-->/g, "");
    const tag = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g;
    const stack = [];
    let cursor = 0;
    for (const match of body.matchAll(tag)) {
        const text = body.slice(cursor, match.index);
        assert.ok(!text.includes("<"), `${label}: stray "<" before offset ${match.index}`);
        assert.doesNotMatch(text, /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/i, `${label}: unescaped "&"`);
        const [, closing, name, , selfClosing] = match;
        if (closing) {
            assert.equal(stack.pop(), name, `${label}: </${name}> closes the wrong element`);
        } else if (!selfClosing) {
            stack.push(name);
        }
        cursor = match.index + match[0].length;
    }
    assert.ok(!body.slice(cursor).includes("<"), `${label}: trailing markup`);
    assert.deepEqual(stack, [], `${label}: unclosed elements`);
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const published = (glob) => fg.sync(glob).filter((file) => !DRAFT_FILES.has(file));
const sourceCount = (glob) => published(glob).length;

before(() => {
    assert.ok(exists("index.html"), "public/ is missing: run `npm run build` before the smoke tests");
    for (const file of fg.sync("**/*.html", { cwd: OUT, ignore: ["pagefind/**"] })) {
        pages.set(file, read(file));
    }
});

test("every expected top-level output file exists", () => {
    const expected = [
        "index.html",
        "404.html",
        "demos/index.html",
        "blog/index.html",
        "about/index.html",
        "feed.xml",
        "sitemap.xml",
        "robots.txt",
        "search-index.json",
        "_headers",
        "assets/js/main.js",
        "assets/scss/main.css",
        "pagefind/pagefind-ui.js",
        "assets/fonts/HankenGrotesk-Variable.woff2",
    ];
    for (const file of expected) assert.ok(exists(file), `missing ${file}`);
});

test("every demo and post source produced a page", () => {
    for (const file of published("src/demos/*.md")) {
        assert.ok(pages.has(`demos/${path.basename(file, ".md")}/index.html`), `no page for ${file}`);
    }
    for (const file of published("src/blog/*.md")) {
        assert.ok(pages.has(`blog/${path.basename(file, ".md")}/index.html`), `no page for ${file}`);
    }
});

test("every internal link, image, and script reference resolves to a built file", () => {
    const broken = [];
    for (const [file, html] of pages) {
        for (const url of internalReferences(html)) {
            const [pathname] = url.split(/[?#]/);
            if (INTENTIONALLY_MISSING.has(pathname)) continue;
            if (RUNTIME_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) continue;
            if (!pageFileForUrl(pathname)) broken.push(`${file} → ${url}`);
        }
    }
    assert.deepEqual(broken, []);
});

test("every #fragment link points at an id that exists on the target page", () => {
    const broken = [];
    for (const [file, html] of pages) {
        const markup = stripNonMarkup(html);
        for (const href of attributeValues(markup, "href")) {
            const hashIndex = href.indexOf("#");
            if (hashIndex === -1 || href.length === hashIndex + 1) continue;
            if (!href.startsWith("#") && !href.startsWith("/")) continue;
            const pathname = href.slice(0, hashIndex);
            const target = pathname ? pageFileForUrl(pathname) : file;
            if (!target || !pages.has(target)) continue;
            const fragment = decodeURIComponent(href.slice(hashIndex + 1));
            if (!idsOf(pages.get(target)).includes(fragment)) broken.push(`${file} → ${href}`);
        }
    }
    assert.deepEqual(broken, []);
});

test("no page has duplicate ids", () => {
    const duplicates = [];
    for (const [file, html] of pages) {
        const seen = new Set();
        for (const id of idsOf(html)) {
            if (seen.has(id)) duplicates.push(`${file}: #${id}`);
            seen.add(id);
        }
    }
    assert.deepEqual(duplicates, []);
});

test("every label, aria-controls, and aria-labelledby reference points at a real id", () => {
    const broken = [];
    for (const [file, html] of pages) {
        const markup = stripNonMarkup(html);
        const ids = new Set(idsOf(html));
        const references = [
            ...attributeValues(markup, "for"),
            ...attributeValues(markup, "aria-controls"),
            ...attributeValues(markup, "aria-labelledby").flatMap((value) => value.split(/\s+/)),
        ];
        for (const id of references) {
            if (!ids.has(id)) broken.push(`${file}: #${id}`);
        }
    }
    assert.deepEqual(broken, []);
});

test("every JSON-LD block is valid JSON with a schema.org context", () => {
    for (const [file, html] of pages) {
        for (const [, json] of html.matchAll(/<script type="?application\/ld\+json"?>([\s\S]*?)<\/script>/g)) {
            const data = JSON.parse(json);
            assert.equal(data["@context"], "https://schema.org", file);
        }
    }
});

test("sitemap.xml is well-formed and every URL in it exists", () => {
    const xml = read("sitemap.xml");
    assertWellFormedXml(xml, "sitemap.xml");
    for (const loc of locs(xml)) {
        assert.ok(loc.startsWith(`${site.url}/`), `${loc} isn't on ${site.url}`);
        assert.ok(pageFileForUrl(loc.slice(site.url.length)), `sitemap lists ${loc}, which wasn't built`);
    }
});

test("sitemap lists every demo, every tag page, and exactly the blog pages that were built", () => {
    const listed = new Set(locs(read("sitemap.xml")).map((loc) => loc.slice(site.url.length)));
    for (const file of published("src/demos/*.md")) {
        assert.ok(listed.has(`/demos/${path.basename(file, ".md")}/`), `sitemap is missing ${file}`);
    }
    for (const file of fg.sync("*/index.html", { cwd: path.join(OUT, "demos/tags") })) {
        assert.ok(listed.has(`/demos/tags/${path.dirname(file)}/`), `sitemap is missing tag page ${file}`);
    }

    const expectedBlogPages = Math.ceil(sourceCount("src/blog/*.md") / site.blogPageSize);
    const builtBlogPages = fg.sync("blog/[0-9]*/index.html", { cwd: OUT }).length + 1;
    const listedBlogPages = [...listed].filter((url) => /^\/blog\/(\d+\/)?$/.test(url)).length;
    assert.equal(builtBlogPages, expectedBlogPages);
    assert.equal(listedBlogPages, expectedBlogPages);
});

test("feed.xml is well-formed Atom with one entry per post, each linking to a real page", () => {
    const xml = read("feed.xml");
    assertWellFormedXml(xml, "feed.xml");
    assert.match(xml, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/);
    const entries = [...xml.matchAll(/<entry>[\s\S]*?<link href="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(entries.length, sourceCount("src/blog/*.md"));
    for (const href of entries) {
        assert.ok(pageFileForUrl(href.slice(site.url.length)), `feed links to ${href}, which wasn't built`);
    }
});

test("search-index.json has one valid entry per demo and post", () => {
    const index = JSON.parse(read("search-index.json"));
    assert.equal(index.length, sourceCount("src/demos/*.md") + sourceCount("src/blog/*.md"));
    for (const entry of index) {
        assert.equal(typeof entry.title, "string");
        assert.equal(typeof entry.description, "string", `${entry.url} has no description`);
        assert.ok(Array.isArray(entry.tags));
        assert.ok(pageFileForUrl(entry.url), `search index points at ${entry.url}, which wasn't built`);
    }
});

test("main.js and main.css are always referenced with a content version", () => {
    const jsVersion = fingerprintFiles(`${OUT}/assets/js/main.js`);
    const cssVersions = new Set();
    for (const [file, html] of pages) {
        const refs = internalReferences(html).filter((url) => /^\/assets\/(js|scss)\//.test(url));
        assert.ok(refs.length >= 2, `${file} doesn't load main.js and main.css`);
        for (const url of refs) {
            const version = new URL(url, site.url).searchParams.get("v");
            assert.match(version ?? "", /^[0-9a-f]{10}$/, `${file}: ${url} is unversioned`);
            if (url.startsWith("/assets/js/")) assert.equal(version, jsVersion, `${file}: stale ${url}`);
            else cssVersions.add(version);
        }
    }
    assert.equal(cssVersions.size, 1, "pages disagree about main.css's version");
});

test("the CSP allows every inline script the site actually ships", () => {
    const headers = read("_headers");
    const policy = headers.match(/Content-Security-Policy-Report-Only: (.+)/)?.[1];
    assert.ok(policy, "_headers has no CSP");
    for (const [file, html] of pages) {
        for (const hash of inlineScriptHashes(html)) {
            assert.ok(policy.includes(hash), `${file} has an inline script missing from the CSP`);
        }
    }
});

test("every demo page has its hero, live implementation, and source links", () => {
    for (const file of published("src/demos/*.md")) {
        const slug = path.basename(file, ".md");
        const html = pages.get(`demos/${slug}/index.html`);
        assert.match(html, /<h1 class="?demo__title/, slug);
        if (/^demoBlock:/m.test(fs.readFileSync(file, "utf8"))) {
            assert.match(html, /id="?live-implementation/, `${slug} lost its Live Implementation`);
        }
        assert.ok(html.includes(`${site.repoUrl}/blob/${site.repoBranch}/src/demos/${slug}.md`), slug);
    }
});

test("the 404 page is a real page that links back into the site", () => {
    const html = read("404.html");
    assert.match(html, /<h1[^>]*>Page not found<\/h1>/);
    assert.ok(internalReferences(html).includes("/demos/"));
});

test("every page has the CSS and Web Fonts switches in its footer", () => {
    for (const [file, html] of pages) {
        const footer = html.split(/<footer/)[1] ?? "";
        for (const name of ["css", "webFonts"]) {
            assert.match(footer, new RegExp(`data-reader-toggle="?${name}`), `${file} is missing the ${name} switch`);
        }
    }
});

test("drafts are left out of the production build entirely", () => {
    assert.ok(DRAFTS.length > 0, "expected at least one draft to check");
    const sitemap = read("sitemap.xml");
    const feed = read("feed.xml");
    const searchIndex = read("search-index.json");
    for (const { file, url } of DRAFTS) {
        assert.equal(pageFileForUrl(url), null, `${file} was built at ${url}`);
        for (const [name, text] of [
            ["sitemap", sitemap],
            ["feed", feed],
            ["search index", searchIndex],
        ]) {
            assert.ok(!text.includes(url), `${url} is listed in the ${name}`);
        }
    }
});

const metaContent = (html, key) =>
    html.match(new RegExp(`<meta content="([^"]*)" (?:property|name)="${key}"`))?.[1] ??
    html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];

test("every page has its own generated social card: a real 1200×630 PNG", () => {
    for (const [file, html] of pages) {
        const ogImage = metaContent(html, "og:image");
        assert.ok(ogImage?.startsWith(`${site.url}/assets/images/og/`), `${file} has og:image ${ogImage}`);
        assert.equal(metaContent(html, "twitter:image"), ogImage, `${file}: twitter:image differs from og:image`);

        const png = fs.readFileSync(path.join(OUT, ogImage.slice(site.url.length)));
        assert.equal(png.subarray(1, 4).toString(), "PNG", file);
        assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630], file);
    }
});

test("every generated social card is used by at least one page", () => {
    const used = new Set();
    for (const html of pages.values()) {
        for (const match of html.matchAll(/\/assets\/images\/og\/([0-9a-f]+\.png)/g)) used.add(match[1]);
    }
    const orphans = fs.readdirSync(path.join(OUT, "assets/images/og")).filter((name) => !used.has(name));
    assert.deepEqual(orphans, []);
});

test("no demo's Live Implementation renders empty", () => {
    for (const file of published("src/demos/*.md")) {
        if (!/^demoBlock:/m.test(fs.readFileSync(file, "utf8"))) continue;
        const slug = path.basename(file, ".md");
        const frame = pages.get(`demos/${slug}/index.html`).split('class="demo__live-frame">')[1] ?? "";
        const beforeContent = frame.split('<div class="demo__content">')[0];
        assert.ok(beforeContent.replace(/<[^>]*>/g, "").trim().length > 0, `${slug}'s Live Implementation is empty`);
    }
});

test("posts and demos track reading position, and every page has a back-to-top link", () => {
    const tagWith = (html, attribute) =>
        html.match(new RegExp(`<[a-z]+\\b[^>]*\\s${attribute}(?:="[^"]*")?[\\s>][^>]*>`))?.[0] ?? "";
    const isHidden = (tag) => /\shidden(?:="[^"]*")?[\s>]/.test(tag);
    for (const [file, html] of pages) {
        const backToTop = tagWith(html, "data-back-to-top");
        assert.match(backToTop, /href="#main"/, `${file} has no back-to-top link`);
        assert.ok(isHidden(backToTop), `${file}'s back-to-top link isn't hidden by default`);

        if (/^(demos|blog)\/[^/]+\/index\.html$/.test(file) && !/^blog\/\d+\//.test(file)) {
            const article = tagWith(html, "data-reading-position");
            assert.ok(article, `${file} doesn't track reading position`);
            assert.match(article, /data-content-version="[0-9a-f]{8}"/, `${file} has no content version`);
            assert.ok(isHidden(tagWith(html, "data-resume-reading")), `${file} has no hidden resume prompt`);
        }
    }
});

test("every lightbox photo links to a full-size image that exists, in both formats", () => {
    let count = 0;
    for (const [file, html] of pages) {
        for (const [tag] of html.matchAll(/<a\b[^>]*\sdata-lightbox-item(?:="[^"]*")?[\s>][^>]*>/g)) {
            count++;
            for (const attribute of ["href", "data-full"]) {
                const url = tag.match(new RegExp(`\\s${attribute}="([^"]+)"`))?.[1];
                assert.ok(url && pageFileForUrl(url), `${file}: lightbox ${attribute} ${url} doesn't exist`);
            }
        }
    }
    assert.ok(count >= 12, `expected the galleries to have lightbox links, found ${count}`);
});

test("favicons, the Apple touch icon, and the web app manifest are all present and valid", () => {
    const ico = fs.readFileSync(path.join(OUT, "favicon.ico"));
    assert.deepEqual([ico.readUInt16LE(0), ico.readUInt16LE(2)], [0, 1], "favicon.ico isn't an ICO file");
    assert.ok(ico.readUInt16LE(4) >= 1);

    const apple = fs.readFileSync(path.join(OUT, "apple-touch-icon.png"));
    assert.deepEqual([apple.readUInt32BE(16), apple.readUInt32BE(20)], [180, 180]);

    const manifest = JSON.parse(read("site.webmanifest"));
    assert.equal(manifest.name, site.title);
    for (const icon of manifest.icons) {
        const png = fs.readFileSync(path.join(OUT, icon.src));
        const [width, height] = icon.sizes.split("x").map(Number);
        assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [width, height], icon.src);
    }

    for (const [file, html] of pages) {
        for (const pattern of [
            /rel="icon"[^>]*href="\/favicon\.ico"|href="\/favicon\.ico"[^>]*rel="icon"/,
            /rel="apple-touch-icon"/,
            /rel="manifest"/,
            /name="theme-color"/,
        ]) {
            assert.match(html, pattern, `${file} is missing ${pattern}`);
        }
    }
});
