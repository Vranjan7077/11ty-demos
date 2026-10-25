export const STORAGE_KEY = "reading-position";
export const SCHEMA_VERSION = 1;
export const MAX_ENTRIES = 30;
export const TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const MIN_PERCENT = 0.03;
export const FINISHED_PERCENT = 0.95;

const emptyStore = () => ({ v: SCHEMA_VERSION, pages: {} });

export function scrollPercent({ scrollY, scrollHeight, viewportHeight }) {
    const max = scrollHeight - viewportHeight;
    if (max <= 0) return 0;
    return Math.min(1, Math.max(0, scrollY / max));
}

export function readStore(storage) {
    try {
        const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) || "null");
        const valid =
            parsed &&
            parsed.v === SCHEMA_VERSION &&
            parsed.pages &&
            typeof parsed.pages === "object" &&
            !Array.isArray(parsed.pages);
        return valid ? parsed : emptyStore();
    } catch {
        return emptyStore();
    }
}

export function writeStore(storage, store) {
    try {
        if (Object.keys(store.pages).length) storage?.setItem(STORAGE_KEY, JSON.stringify(store));
        else storage?.removeItem(STORAGE_KEY);
    } catch {}
}

function isFresh(entry, now) {
    return (
        entry &&
        typeof entry.percent === "number" &&
        typeof entry.updatedAt === "number" &&
        now - entry.updatedAt <= TTL_MS
    );
}

export function prune(store, now) {
    const kept = Object.entries(store.pages)
        .filter(([, entry]) => isFresh(entry, now))
        .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_ENTRIES);
    return { v: SCHEMA_VERSION, pages: Object.fromEntries(kept) };
}

export function recordPosition(store, key, { percent, title, contentVersion }, now) {
    const pages = { ...store.pages };
    if (percent < MIN_PERCENT || percent >= FINISHED_PERCENT) {
        delete pages[key];
    } else {
        pages[key] = { percent: Math.round(percent * 1000) / 1000, title, contentVersion, updatedAt: now };
    }
    return prune({ v: SCHEMA_VERSION, pages }, now);
}

export function forget(store, key) {
    const pages = { ...store.pages };
    delete pages[key];
    return { v: SCHEMA_VERSION, pages };
}

export function resumableEntry(store, key, { contentVersion, now }) {
    const entry = store.pages[key];
    if (!isFresh(entry, now)) return null;
    if (entry.percent < MIN_PERCENT || entry.percent >= FINISHED_PERCENT) return null;
    if (entry.contentVersion && contentVersion && entry.contentVersion !== contentVersion) return null;
    return entry;
}

export function savedPositions(store, now) {
    return Object.entries(prune(store, now).pages).map(([path, entry]) => ({ path, ...entry }));
}
