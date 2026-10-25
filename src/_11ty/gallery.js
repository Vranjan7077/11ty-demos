import Image from "@11ty/eleventy-img";
import fastGlob from "fast-glob";
import { fetchPexelsPhotos } from "./pexels.js";

async function placeholderPhotos(fallbackGlob) {
    const files = (await fastGlob(fallbackGlob)).sort();
    return files.map((url, index) => ({
        url,
        alt: `Placeholder gradient ${index + 1} of ${files.length}, shown because Pexels photos weren't available for this build`,
    }));
}

export async function buildGallery({ endpoint, count = 6, fallbackGlob, widths, sizes }) {
    let photos;
    let source = "pexels";
    try {
        photos = await fetchPexelsPhotos(endpoint, count);
    } catch (error) {
        console.warn(`[gallery] Pexels unavailable (${error.message}), using placeholders from ${fallbackGlob}`);
        photos = await placeholderPhotos(fallbackGlob);
        source = "placeholder";
    }

    const items = await Promise.all(
        photos.map(async (photo) => {
            const metadata = await Image(photo.url, {
                widths,
                formats: ["webp", "jpeg"],
                outputDir: "public/assets/images/optimized/",
                urlPath: "/assets/images/optimized/",
            });

            const largestJpeg = metadata.jpeg.at(-1);
            return {
                html: Image.generateHTML(metadata, {
                    alt: photo.alt,
                    sizes,
                    loading: "lazy",
                    decoding: "async",
                    "eleventy:ignore": "",
                }),
                full: largestJpeg.url,
                fullWebp: metadata.webp.at(-1).url,
                width: largestJpeg.width,
                height: largestJpeg.height,
                alt: photo.alt,
            };
        })
    );

    return { source, items };
}
