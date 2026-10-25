export const IMAGE_TRANSFORM_OPTIONS = {
    urlPath: "/assets/images/optimized/",
    formats: ["webp", "auto"],
    widths: [480, 960, 1600],
    svgShortCircuit: true,
    htmlOptions: {
        imgAttributes: {
            loading: "lazy",
            decoding: "async",
            sizes: "(min-width: 78rem) 72rem, calc(100vw - 3rem)",
        },
    },
};
