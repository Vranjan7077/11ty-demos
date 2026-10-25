import * as sass from "sass";
import { fingerprintFiles } from "../fingerprint.js";

const SOURCES = {
    "/assets/js/main.js": () => fingerprintFiles("public/assets/js/main.js"),
    "/assets/scss/main.css": () => fingerprintFiles(["src/assets/scss/**/*.scss", "src/_11ty/sass.js"], sass.info),
};

export default function assetUrl(url) {
    const fingerprint = SOURCES[url];
    if (!fingerprint) {
        throw new Error(`assetUrl: "${url}" has no fingerprint source. Add it to SOURCES in assetUrl.js.`);
    }
    return `${url}?v=${fingerprint()}`;
}
