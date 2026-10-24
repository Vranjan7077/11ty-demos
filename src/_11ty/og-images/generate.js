import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "fonts");
const FONT_OPTIONS = {
    fontFiles: [path.join(FONT_DIR, "HankenGrotesk-Regular.ttf"), path.join(FONT_DIR, "HankenGrotesk-SemiBold.ttf")],
    loadSystemFonts: false,
    defaultFontFamily: "Hanken Grotesk",
};

export const WIDTH = 1200;
export const HEIGHT = 630;

const COLORS = {
    canvas: "#4a5af0",
    card: "#ffffff",
    ink: "#10131a",
    muted: "#4a5068",
    accent: "#4351db",
};

const CARD = { x: 48, y: 40, width: 1088, height: 534, shadow: 16, border: 6, padding: 64 };
const THUMB = { width: 360, height: 203 };
const CONTENT_LEFT = CARD.x + CARD.padding;
const CONTENT_RIGHT = CARD.x + CARD.width - CARD.padding;

const TYPE = {
    eyebrow: { size: 24, weight: 600, tracking: 2 },
    title: { size: 64, weight: 600, lineHeight: 74 },
    description: { size: 28, weight: 400, lineHeight: 40 },
    footer: { size: 26, weight: 600 },
};

export function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

const widthCache = new Map();

export function measureText(text, { size, weight }) {
    const key = `${size}|${weight}|${text}`;
    if (!widthCache.has(key)) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="${size * 2}"><text x="0" y="${size * 1.5}" font-family="Hanken Grotesk" font-weight="${weight}" font-size="${size}">${escapeXml(text)}</text></svg>`;
        const box = new Resvg(svg, { font: FONT_OPTIONS }).getBBox();
        widthCache.set(key, box ? box.width : text.length * size * 0.55);
    }
    return widthCache.get(key);
}

export function wrapText(text, maxWidth, maxLines, measure) {
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (!current || measure(candidate) <= maxWidth) {
            current = candidate;
            continue;
        }
        lines.push(current);
        current = word;
        if (lines.length === maxLines) break;
    }
    if (lines.length < maxLines && current) lines.push(current);

    const used = lines.join(" ").split(/\s+/).filter(Boolean).length;
    if (used < words.length) {
        let last = lines[maxLines - 1];
        while (last.includes(" ") && measure(`${last}…`) > maxWidth) {
            last = last.slice(0, last.lastIndexOf(" "));
        }
        lines[maxLines - 1] = `${last.replace(/[\s,.;:—-]+$/, "")}…`;
    }
    return lines;
}

function textLines(lines, { x, y, lineHeight, size, weight, fill }) {
    return lines
        .map(
            (line, index) =>
                `<text x="${x}" y="${y + index * lineHeight}" font-family="Hanken Grotesk" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(line)}</text>`
        )
        .join("");
}

export function cardSvg({ title, description, eyebrow, thumbnailSvg, siteName, siteHost }, measure = measureText) {
    const hasThumb = Boolean(thumbnailSvg);
    const thumbX = CONTENT_RIGHT - THUMB.width;
    const textWidth = (hasThumb ? thumbX - 48 : CONTENT_RIGHT) - CONTENT_LEFT;

    const eyebrowY = CARD.y + CARD.padding + TYPE.eyebrow.size;
    const titleLines = wrapText(title, textWidth, 3, (t) => measure(t, TYPE.title));
    const titleY = eyebrowY + 24 + TYPE.title.size;
    const descriptionY = titleY + (titleLines.length - 1) * TYPE.title.lineHeight + 28 + TYPE.description.size;
    const descriptionLines = description
        ? wrapText(description, textWidth, titleLines.length === 3 ? 2 : 3, (t) => measure(t, TYPE.description))
        : [];
    const footerY = CARD.y + CARD.height - CARD.padding + 8;

    const thumb = hasThumb
        ? `<rect x="${thumbX - 3}" y="${eyebrowY - 3}" width="${THUMB.width + 6}" height="${THUMB.height + 6}" fill="${COLORS.ink}"/>` +
          `<image x="${thumbX}" y="${eyebrowY}" width="${THUMB.width}" height="${THUMB.height}" preserveAspectRatio="xMidYMid slice" href="data:image/svg+xml;base64,${Buffer.from(thumbnailSvg).toString("base64")}"/>`
        : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.canvas}"/>
<rect x="${CARD.x + CARD.shadow}" y="${CARD.y + CARD.shadow}" width="${CARD.width}" height="${CARD.height}" fill="${COLORS.ink}"/>
<rect x="${CARD.x}" y="${CARD.y}" width="${CARD.width}" height="${CARD.height}" fill="${COLORS.card}" stroke="${COLORS.ink}" stroke-width="${CARD.border}"/>
<text x="${CONTENT_LEFT}" y="${eyebrowY}" font-family="Hanken Grotesk" font-size="${TYPE.eyebrow.size}" font-weight="${TYPE.eyebrow.weight}" letter-spacing="${TYPE.eyebrow.tracking}" fill="${COLORS.accent}">${escapeXml(String(eyebrow).toUpperCase())}</text>
${textLines(titleLines, { x: CONTENT_LEFT, y: titleY, ...TYPE.title, fill: COLORS.ink })}
${textLines(descriptionLines, { x: CONTENT_LEFT, y: descriptionY, ...TYPE.description, fill: COLORS.muted })}
${thumb}
<text x="${CONTENT_LEFT}" y="${footerY}" font-family="Hanken Grotesk" font-size="${TYPE.footer.size}" font-weight="${TYPE.footer.weight}" fill="${COLORS.ink}"><tspan fill="${COLORS.accent}">&lt;/&gt;</tspan> ${escapeXml(siteName)}</text>
<text x="${CONTENT_RIGHT}" y="${footerY}" text-anchor="end" font-family="Hanken Grotesk" font-size="24" font-weight="400" fill="${COLORS.muted}">${escapeXml(siteHost)}</text>
</svg>`;
}

export function renderCard(data) {
    return new Resvg(cardSvg(data), { font: FONT_OPTIONS, fitTo: { mode: "width", value: WIDTH } }).render().asPng();
}

export function readThumbnail(thumbnail) {
    if (!thumbnail || !thumbnail.endsWith(".svg")) return null;
    const file = path.join("src", thumbnail);
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}
