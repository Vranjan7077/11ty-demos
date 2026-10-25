import { createHash } from "node:crypto";
import fs from "node:fs";
import fg from "fast-glob";

const cache = (globalThis[Symbol.for("11ty-demos.fingerprints")] ??= new Map());

export function clearFingerprintCache() {
    cache.clear();
}

export function fingerprintFiles(patterns, extra = "") {
    const key = JSON.stringify([patterns, extra]);
    if (cache.has(key)) return cache.get(key);

    const files = fg.sync(patterns).sort();
    if (!files.length) {
        throw new Error(`fingerprintFiles: nothing matched ${[].concat(patterns).join(", ")}`);
    }

    const hash = createHash("sha256");
    for (const file of files) {
        hash.update(file);
        hash.update(fs.readFileSync(file));
    }
    hash.update(extra);
    const digest = hash.digest("hex").slice(0, 10);
    cache.set(key, digest);
    return digest;
}
