import { buildGallery } from "../_11ty/gallery.js";

export default function () {
    return buildGallery({
        endpoint: "curated",
        fallbackGlob: "src/assets/images/demos/gallery/*.jpg",
        widths: [400, 800],
        sizes: "(min-width: 40rem) 30vw, 45vw",
    });
}
