import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";

const INLINE_SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const DATA_BLOCK_TYPE = /\btype=["']?application\/(?:ld\+)?json/i;

export function inlineScriptHashes(html) {
    const hashes = new Set();
    for (const [, attributes, body] of html.matchAll(INLINE_SCRIPT)) {
        if (/\bsrc=/i.test(attributes) || DATA_BLOCK_TYPE.test(attributes) || !body.trim()) continue;
        hashes.add(`'sha256-${createHash("sha256").update(body).digest("base64")}'`);
    }
    return hashes;
}

export function buildPolicy(scriptHashes) {
    return [
        "default-src 'self'",
        `script-src 'self' 'wasm-unsafe-eval' ${[...scriptHashes].sort().join(" ")}`.trim(),
        "style-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "worker-src 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "object-src 'none'",
    ].join("; ");
}

export async function writeCspHeaders(outputDir) {
    const pages = await fg("**/*.html", { cwd: outputDir });
    const hashes = new Set();
    for (const page of pages) {
        const html = await fs.readFile(path.join(outputDir, page), "utf8");
        inlineScriptHashes(html).forEach((hash) => hashes.add(hash));
    }

    const headers = `/*\n  Content-Security-Policy-Report-Only: ${buildPolicy(hashes)}\n`;
    await fs.writeFile(path.join(outputDir, "_headers"), headers);
    return hashes;
}
