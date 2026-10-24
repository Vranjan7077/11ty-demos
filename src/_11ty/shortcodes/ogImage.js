import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import site from "../../_data/site.js";
import { fingerprintFiles } from "../fingerprint.js";
import { readThumbnail, renderCard } from "../og-images/generate.js";

const CACHE_DIR = ".cache/og-images";
const OUTPUT_DIR = "public/assets/images/og";
const URL_PATH = "/assets/images/og";

const inFlight = new Map();

export function cardInputs({ title, description, eyebrow, thumbnail }) {
    return {
        title: title || site.title,
        description: description || "",
        eyebrow: eyebrow || site.title,
        thumbnailSvg: readThumbnail(thumbnail),
        siteName: site.shortTitle,
        siteHost: new URL(site.url).host,
    };
}

export function cardHash(inputs) {
    return createHash("sha256")
        .update(fingerprintFiles(["src/_11ty/og-images/**/*"]))
        .update(JSON.stringify(inputs))
        .digest("hex")
        .slice(0, 12);
}

async function ensureCard(hash, inputs) {
    const cached = path.join(CACHE_DIR, `${hash}.png`);
    const output = path.join(OUTPUT_DIR, `${hash}.png`);
    try {
        await fs.access(cached);
    } catch {
        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.writeFile(cached, renderCard(inputs));
    }
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.copyFile(cached, output);
}

export default async function ogImage(title, description, eyebrow, thumbnail) {
    const inputs = cardInputs({ title, description, eyebrow, thumbnail });
    const hash = cardHash(inputs);
    if (!inFlight.has(hash)) inFlight.set(hash, ensureCard(hash, inputs));
    await inFlight.get(hash);
    return `${URL_PATH}/${hash}.png`;
}
