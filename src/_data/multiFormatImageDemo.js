import Image from "@11ty/eleventy-img";

export default async function () {
    const metadata = await Image("src/assets/images/demos/gradient-source.jpg", {
        widths: [400, 800, 1200],
        formats: ["avif", "webp", "jpeg"],
        outputDir: "public/assets/images/optimized/",
        urlPath: "/assets/images/optimized/",
    });

    return Image.generateHTML(metadata, {
        alt: "A generated gradient image used to compare AVIF, WebP, and JPEG output",
        sizes: "(min-width: 40rem) 30rem, 90vw",
        loading: "lazy",
        decoding: "async",
    });
}
