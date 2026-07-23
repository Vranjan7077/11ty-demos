import { getStore } from "@netlify/blobs";

export default async (request) => {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") || "site";

    const store = getStore("page-views");
    const current = await store.get(key, { type: "text" });
    const next = (parseInt(current, 10) || 0) + 1;
    await store.set(key, String(next));

    return new Response(JSON.stringify({ key, views: next }), {
        headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
        },
    });
};
