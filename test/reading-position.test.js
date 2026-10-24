import { test } from "node:test";
import assert from "node:assert/strict";

import {
    STORAGE_KEY,
    MAX_ENTRIES,
    TTL_MS,
    scrollPercent,
    readStore,
    writeStore,
    recordPosition,
    forget,
    resumableEntry,
    savedPositions,
} from "../src/assets/js/reading-position-store.js";

const NOW = 1_800_000_000_000;
const empty = () => ({ v: 1, pages: {} });

function fakeStorage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        data,
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: (key) => data.delete(key),
    };
}

test("scrollPercent is clamped between 0 and 1 and 0 for pages that don't scroll", () => {
    assert.equal(scrollPercent({ scrollY: 500, scrollHeight: 2000, viewportHeight: 1000 }), 0.5);
    assert.equal(scrollPercent({ scrollY: 5000, scrollHeight: 2000, viewportHeight: 1000 }), 1);
    assert.equal(scrollPercent({ scrollY: -40, scrollHeight: 2000, viewportHeight: 1000 }), 0);
    assert.equal(scrollPercent({ scrollY: 0, scrollHeight: 800, viewportHeight: 1000 }), 0);
});

test("recordPosition saves the middle of a page, rounded, with its title and content version", () => {
    const store = recordPosition(empty(), "/a/", { percent: 0.45678, title: "A", contentVersion: "v1" }, NOW);
    assert.deepEqual(store.pages["/a/"], { percent: 0.457, title: "A", contentVersion: "v1", updatedAt: NOW });
});

test("recordPosition forgets a page that's barely started or finished", () => {
    const saved = recordPosition(empty(), "/a/", { percent: 0.5 }, NOW);
    assert.equal(recordPosition(saved, "/a/", { percent: 0.01 }, NOW).pages["/a/"], undefined);
    assert.equal(recordPosition(saved, "/a/", { percent: 0.97 }, NOW).pages["/a/"], undefined);
});

test("only the newest 30 pages are kept", () => {
    let store = empty();
    for (let i = 0; i < MAX_ENTRIES + 5; i++) store = recordPosition(store, `/p${i}/`, { percent: 0.5 }, NOW + i);
    const keys = Object.keys(store.pages);
    assert.equal(keys.length, MAX_ENTRIES);
    assert.ok(!keys.includes("/p0/"));
    assert.ok(keys.includes(`/p${MAX_ENTRIES + 4}/`));
});

test("entries older than 30 days are dropped and never offered", () => {
    const store = recordPosition(empty(), "/old/", { percent: 0.5 }, NOW - TTL_MS - 1);
    assert.equal(resumableEntry(store, "/old/", { now: NOW }), null);
    assert.deepEqual(savedPositions(store, NOW), []);
});

test("resumableEntry offers a saved position only while the content is unchanged", () => {
    const store = recordPosition(empty(), "/a/", { percent: 0.5, contentVersion: "v1" }, NOW);
    assert.equal(resumableEntry(store, "/a/", { contentVersion: "v1", now: NOW }).percent, 0.5);
    assert.equal(resumableEntry(store, "/a/", { contentVersion: "v2", now: NOW }), null);
    assert.equal(resumableEntry(store, "/missing/", { contentVersion: "v1", now: NOW }), null);
});

test("forget removes one page and leaves the rest", () => {
    let store = recordPosition(empty(), "/a/", { percent: 0.5 }, NOW);
    store = recordPosition(store, "/b/", { percent: 0.5 }, NOW);
    assert.deepEqual(Object.keys(forget(store, "/a/").pages), ["/b/"]);
});

test("readStore ignores corrupt data and other schema versions", () => {
    for (const bad of ["not json", "[]", '{"v":2,"pages":{}}', '{"v":1,"pages":[]}', "null"]) {
        assert.deepEqual(readStore(fakeStorage({ [STORAGE_KEY]: bad })), empty(), bad);
    }
    assert.deepEqual(readStore(null), empty());
});

test("writeStore removes the key entirely when nothing is saved, and survives blocked storage", () => {
    const storage = fakeStorage();
    writeStore(storage, recordPosition(empty(), "/a/", { percent: 0.5 }, NOW));
    assert.ok(storage.getItem(STORAGE_KEY));
    writeStore(storage, empty());
    assert.equal(storage.getItem(STORAGE_KEY), null);
    const blocked = {
        setItem() {
            throw new Error("quota");
        },
        removeItem() {
            throw new Error("quota");
        },
    };
    assert.doesNotThrow(() => writeStore(blocked, recordPosition(empty(), "/a/", { percent: 0.5 }, NOW)));
});
