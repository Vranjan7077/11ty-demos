export const STORAGE_KEY = "reader-preferences";

function storageOrNull(storage) {
    try {
        return storage ?? globalThis.localStorage ?? null;
    } catch {
        return null;
    }
}

export function readPreferences(storage) {
    try {
        const value = JSON.parse(storageOrNull(storage)?.getItem(STORAGE_KEY) || "{}");
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
        return {};
    }
}

export function isEnabled(preferences, name) {
    return preferences[name] !== false;
}

export function writePreference(name, enabled, storage) {
    const preferences = readPreferences(storage);
    if (enabled) delete preferences[name];
    else preferences[name] = false;

    try {
        const target = storageOrNull(storage);
        if (Object.keys(preferences).length) target?.setItem(STORAGE_KEY, JSON.stringify(preferences));
        else target?.removeItem(STORAGE_KEY);
    } catch {}
    return preferences;
}
