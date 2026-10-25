import { buildGallery } from "../_11ty/gallery.js";

export default function () {
    return buildGallery({
        endpoint: "search?query=architecture&orientation=portrait",
        fallbackGlob: "src/assets/images/demos/masonry/*.jpg",
        widths: [400, 800],
        sizes: "(min-width: 40rem) 30vw, 45vw",
    });
}
