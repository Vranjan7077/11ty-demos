export const STORE_NAME = "page-views";
export const COUNTER_KEYS = new Set(["view-counter-demo"]);
export const MAX_ATTEMPTS = 5;

function json(status, body, headers = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
            ...headers,
        },
    });
}

function parseCount(value) {
    const count = Number.parseInt(value, 10);
    return Number.isSafeInteger(count) && count >= 0 ? count : 0;
}

async function readCount(store, key) {
    const entry = await store.getWithMetadata(key, { type: "text", consistency: "strong" });
    return entry ? { views: parseCount(entry.data), etag: entry.etag } : { views: 0, etag: null };
}

async function increment(store, key) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const { views, etag } = await readCount(store, key);
        const next = views + 1;
        const condition = etag ? { onlyIfMatch: etag } : { onlyIfNew: true };
        const { modified } = await store.set(key, String(next), condition);
        if (modified) return next;
    }
    return null;
}

export function createViewsHandler(getStore) {
    return async (request) => {
        if (request.method !== "GET" && request.method !== "POST") {
            return json(405, { error: "Method not allowed" }, { allow: "GET, POST" });
        }

        const key = new URL(request.url).searchParams.get("key");
        if (!key) {
            return json(400, { error: "Missing key" });
        }
        if (!COUNTER_KEYS.has(key)) {
            return json(400, { error: "Unknown counter key" });
        }

        try {
            const store = getStore(STORE_NAME);

            if (request.method === "GET") {
                const { views } = await readCount(store, key);
                return json(200, { key, views });
            }

            const views = await increment(store, key);
            if (views === null) {
                return json(503, { error: "Counter is busy, try again" }, { "retry-after": "1" });
            }
            return json(200, { key, views });
        } catch (error) {
            console.error(`[views] storage error: ${error.message}`);
            return json(503, { error: "Counter storage unavailable" });
        }
    };
}
