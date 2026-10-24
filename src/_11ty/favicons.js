import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const FAVICON_SOURCE = "src/assets/images/favicon.svg";
const BRAND = "#5b6bff";

export const FAVICON_OUTPUTS = [
    { file: "apple-touch-icon.png", size: 180, background: BRAND },
    { file: "assets/images/icons/icon-192.png", size: 192 },
    { file: "assets/images/icons/icon-512.png", size: 512 },
    { file: "assets/images/icons/icon-maskable-512.png", size: 512, background: BRAND, padding: 0.1 },
];

export function icoFromPngs(images) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);

    let offset = header.length + images.length * 16;
    const entries = images.map(({ size, data }) => {
        const entry = Buffer.alloc(16);
        entry.writeUInt8(size >= 256 ? 0 : size, 0);
        entry.writeUInt8(size >= 256 ? 0 : size, 1);
        entry.writeUInt16LE(1, 4);
        entry.writeUInt16LE(32, 6);
        entry.writeUInt32LE(data.length, 8);
        entry.writeUInt32LE(offset, 12);
        offset += data.length;
        return entry;
    });

    return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
}

export async function renderIcon(svg, { size, background, padding = 0 }) {
    const inner = Math.round(size * (1 - 2 * padding));
    const icon = await sharp(svg, { density: 1200 }).resize(inner, inner).png().toBuffer();
    if (!background && inner === size) return icon;

    return sharp({
        create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } },
    })
        .composite([{ input: icon, gravity: "center" }])
        .png()
        .toBuffer();
}

async function isFresh(output, sourceTime) {
    try {
        return (await fs.stat(output)).mtimeMs >= sourceTime;
    } catch {
        return false;
    }
}

export async function writeFavicons(outputDir) {
    const sourceTime = (await fs.stat(FAVICON_SOURCE)).mtimeMs;
    const targets = [...FAVICON_OUTPUTS.map(({ file }) => file), "favicon.ico"].map((file) =>
        path.join(outputDir, file)
    );
    if ((await Promise.all(targets.map((target) => isFresh(target, sourceTime)))).every(Boolean)) return;

    const svg = await fs.readFile(FAVICON_SOURCE);
    await Promise.all(
        FAVICON_OUTPUTS.map(async (output) => {
            const target = path.join(outputDir, output.file);
            await fs.mkdir(path.dirname(target), { recursive: true });
            await fs.writeFile(target, await renderIcon(svg, output));
        })
    );

    const icoImages = await Promise.all(
        [16, 32].map(async (size) => ({ size, data: await renderIcon(svg, { size }) }))
    );
    await fs.writeFile(path.join(outputDir, "favicon.ico"), icoFromPngs(icoImages));
}
