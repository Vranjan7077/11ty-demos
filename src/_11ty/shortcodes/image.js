import Image from "@11ty/eleventy-img";

export default async function image(src, alt, sizes = "100vw") {
    if (!alt && alt !== "") {
        throw new Error(`Missing alt text for image: ${src}`);
    }

    const metadata = await Image(src, {
        widths: [400, 800, 1200],
        formats: ["webp"],
        outputDir: "public/assets/images/optimized/",
        urlPath: "/assets/images/optimized/",
    });

    return Image.generateHTML(metadata, {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
    });
}
