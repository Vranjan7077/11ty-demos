import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { icoFromPngs, renderIcon, FAVICON_SOURCE } from "../src/_11ty/favicons.js";

const pngSize = (png) => [png.readUInt32BE(16), png.readUInt32BE(20)];

test("icoFromPngs writes a valid ICO header and directory pointing at each PNG", () => {
    const a = Buffer.from("first-png");
    const b = Buffer.from("second-png-data");
    const ico = icoFromPngs([
        { size: 16, data: a },
        { size: 32, data: b },
    ]);

    assert.deepEqual([ico.readUInt16LE(0), ico.readUInt16LE(2), ico.readUInt16LE(4)], [0, 1, 2]);
    const firstOffset = ico.readUInt32LE(6 + 12);
    const secondOffset = ico.readUInt32LE(22 + 12);
    assert.equal(ico.readUInt8(6), 16);
    assert.equal(ico.readUInt8(22), 32);
    assert.equal(firstOffset, 6 + 2 * 16);
    assert.equal(secondOffset, firstOffset + a.length);
    assert.equal(ico.subarray(firstOffset, firstOffset + a.length).toString(), "first-png");
    assert.equal(ico.subarray(secondOffset).toString(), "second-png-data");
});

test("icoFromPngs stores 256px images as 0, as the format requires", () => {
    const ico = icoFromPngs([{ size: 256, data: Buffer.from("x") }]);
    assert.equal(ico.readUInt8(6), 0);
});

test("renderIcon produces square PNGs of the requested size, with or without a background", async () => {
    const svg = fs.readFileSync(FAVICON_SOURCE);
    for (const options of [
        { size: 32 },
        { size: 180, background: "#5b6bff" },
        { size: 512, background: "#5b6bff", padding: 0.1 },
    ]) {
        const png = await renderIcon(svg, options);
        assert.equal(png.subarray(1, 4).toString(), "PNG");
        assert.deepEqual(pngSize(png), [options.size, options.size]);
    }
});
