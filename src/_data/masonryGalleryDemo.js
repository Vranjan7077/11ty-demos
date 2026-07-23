import Image from "@11ty/eleventy-img";
import fastGlob from "fast-glob";
import { fetchPexelsPhotos } from "../_11ty/pexels.js";

async function fallbackPhotos() {
    const files = await fastGlob("src/assets/images/demos/masonry/*.jpg");
    files.sort();
    return files.map((file) => ({ url: file, alt: "" }));
}

export default async function () {
    let photos;
    try {
        photos = await fetchPexelsPhotos("search?query=architecture&orientation=portrait", 6);
    } catch {
        photos = await fallbackPhotos();
    }

    const items = [];
    for (const photo of photos) {
        const metadata = await Image(photo.url, {
            widths: [400],
            formats: ["webp", "jpeg"],
            outputDir: "public/assets/images/optimized/",
            urlPath: "/assets/images/optimized/",
        });

        items.push(
            Image.generateHTML(metadata, {
                alt: photo.alt,
                sizes: "(min-width: 40rem) 30vw, 45vw",
                loading: "lazy",
                decoding: "async",
            })
        );
    }

    return items;
}
