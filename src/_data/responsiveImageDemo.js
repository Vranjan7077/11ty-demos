import Image from "@11ty/eleventy-img";

export default async function () {
    const metadata = await Image("src/assets/images/demos/dark-mode.svg", {
        widths: [400, 800, 1200],
        formats: ["webp"],
        outputDir: "public/assets/images/optimized/",
        urlPath: "/assets/images/optimized/",
    });

    return Image.generateHTML(metadata, {
        alt: "Sun icon from the Dark Mode demo, reused here as a responsive-images source",
        sizes: "(min-width: 40rem) 20rem, 90vw",
        loading: "lazy",
        decoding: "async",
    });
}
