import fs from "node:fs";
import Image from "@11ty/eleventy-img";
import { IMAGE_TRANSFORM_OPTIONS } from "../_11ty/imageTransformOptions.js";

const SOURCES = [
    {
        file: "src/demos/images/vranjan-home-before.png",
        label: "Before the redesign",
        alt: "The vranjan.dev home page before its redesign, in dark mode",
    },
    {
        file: "src/demos/images/vranjan-home-after.png",
        label: "After the redesign",
        alt: "The vranjan.dev home page after its redesign, in dark mode",
    },
];

export default function () {
    const { urlPath, formats, widths, svgShortCircuit } = IMAGE_TRANSFORM_OPTIONS;
    return Promise.all(
        SOURCES.map(async ({ file, label, alt }) => {
            const metadata = await Image(file, {
                urlPath,
                formats,
                widths,
                svgShortCircuit,
                outputDir: `public${urlPath}`,
            });
            const outputs = Object.values(metadata)
                .flat()
                .map(({ format, width, size }) => ({ format, width, bytes: size }))
                .sort((a, b) => a.format.localeCompare(b.format) || a.width - b.width);
            return {
                label,
                alt,
                src: `./images/${file.split("/").pop()}`,
                originalBytes: fs.statSync(file).size,
                outputs,
            };
        })
    );
}
