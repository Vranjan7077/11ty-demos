import { test } from "node:test";
import assert from "node:assert/strict";

import { createViewsHandler, MAX_ATTEMPTS, STORE_NAME } from "../netlify/lib/view-counter.js";

const tick = () => new Promise((resolve) => setImmediate(resolve));

function createFakeStore({ failWith } = {}) {
    const entries = new Map();
    let version = 0;
    return {
        entries,
        async getWithMetadata(key) {
            await tick();
            if (failWith) throw failWith;
            const entry = entries.get(key);
            return entry ? { data: entry.value, etag: entry.etag, metadata: {} } : null;
        },
        async set(key, value, options = {}) {
            await tick();
            if (failWith) throw failWith;
            const entry = entries.get(key);
            if (options.onlyIfNew && entry) return { modified: false };
            if (options.onlyIfMatch && (!entry || entry.etag !== options.onlyIfMatch)) return { modified: false };
            const etag = `"${++version}"`;
            entries.set(key, { value, etag });
            return { modified: true, etag };
        },
    };
}

function setup(storeOptions) {
    const store = createFakeStore(storeOptions);
    const storeNames = [];
    const handler = createViewsHandler((name) => {
        storeNames.push(name);
        return store;
    });
    return { store, storeNames, handler };
}

const request = (method, query = "?key=view-counter-demo") =>
    new Request(`https://example.com/.netlify/functions/views${query}`, { method });

test("views POST creates the counter at 1 and increments from there", async () => {
    const { handler, storeNames } = setup();
    const first = await handler(request("POST"));
    assert.equal(first.status, 200);
    assert.deepEqual(await first.json(), { key: "view-counter-demo", views: 1 });

    const second = await handler(request("POST"));
    assert.deepEqual(await second.json(), { key: "view-counter-demo", views: 2 });
    assert.deepEqual(new Set(storeNames), new Set([STORE_NAME]));
});

test("views GET reads the count without changing it", async () => {
    const { handler, store } = setup();
    await handler(request("POST"));

    const response = await handler(request("GET"));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { key: "view-counter-demo", views: 1 });
    assert.equal(store.entries.get("view-counter-demo").value, "1");
});

test("views GET on a counter that doesn't exist yet returns 0 and creates nothing", async () => {
    const { handler, store } = setup();
    const response = await handler(request("GET"));
    assert.deepEqual(await response.json(), { key: "view-counter-demo", views: 0 });
    assert.equal(store.entries.size, 0);
});

test("views responses are JSON and never cached", async () => {
    const { handler } = setup();
    const response = await handler(request("GET"));
    assert.equal(response.headers.get("content-type"), "application/json");
    assert.equal(response.headers.get("cache-control"), "no-store");
});

test("views rejects a missing key", async () => {
    const { handler } = setup();
    const response = await handler(request("POST", ""));
    assert.equal(response.status, 400);
});

test("views rejects keys outside the allowlist and never writes them", async () => {
    const { handler, store } = setup();
    for (const query of ["?key=site", "?key=../secrets", `?key=${"a".repeat(5000)}`, "?key=view-counter-demo%00"]) {
        const response = await handler(request("POST", query));
        assert.equal(response.status, 400, query.slice(0, 30));
    }
    assert.equal(store.entries.size, 0);
});

test("views rejects unsupported methods with 405 and an Allow header", async () => {
    const { handler } = setup();
    for (const method of ["PUT", "DELETE", "PATCH"]) {
        const response = await handler(request(method));
        assert.equal(response.status, 405);
        assert.equal(response.headers.get("allow"), "GET, POST");
    }
});

test("views treats a corrupted stored value as 0 instead of returning NaN", async () => {
    const { handler, store } = setup();
    store.entries.set("view-counter-demo", { value: "not a number", etag: '"x"' });
    const response = await handler(request("POST"));
    assert.deepEqual(await response.json(), { key: "view-counter-demo", views: 1 });
});

test("views returns 503 instead of throwing when storage fails", async () => {
    const { handler } = setup({ failWith: new Error("blobs down") });
    const originalError = console.error;
    console.error = () => {};
    try {
        for (const method of ["GET", "POST"]) {
            const response = await handler(request(method));
            assert.equal(response.status, 503);
            assert.equal(typeof (await response.json()).error, "string");
        }
    } finally {
        console.error = originalError;
    }
});

test("views loses no increments when requests race, up to the retry limit", async () => {
    const { handler, store } = setup();
    const responses = await Promise.all(Array.from({ length: MAX_ATTEMPTS }, () => handler(request("POST"))));
    assert.deepEqual(
        responses.map((r) => r.status),
        Array(MAX_ATTEMPTS).fill(200)
    );
    const counts = (await Promise.all(responses.map((r) => r.json()))).map((body) => body.views).sort((a, b) => a - b);
    assert.deepEqual(
        counts,
        Array.from({ length: MAX_ATTEMPTS }, (_, i) => i + 1)
    );
    assert.equal(store.entries.get("view-counter-demo").value, String(MAX_ATTEMPTS));
});

test("views under heavy contention never overcounts: stored total equals successful increments", async () => {
    const { handler, store } = setup();
    const responses = await Promise.all(Array.from({ length: 25 }, () => handler(request("POST"))));
    const succeeded = responses.filter((r) => r.status === 200).length;
    assert.ok(responses.every((r) => r.status === 200 || r.status === 503));
    assert.ok(succeeded >= MAX_ATTEMPTS);
    assert.equal(store.entries.get("view-counter-demo").value, String(succeeded));
});
