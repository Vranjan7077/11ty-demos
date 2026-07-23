import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

export const sassExtension = {
    outputFileExtension: "css",
    compile: async function (inputContent, inputPath) {
        const parsed = path.parse(inputPath);
        if (parsed.name.startsWith("_")) {
            return;
        }

        return async () => {
            const result = sass.compile(inputPath, {
                loadPaths: [parsed.dir],
                style: "compressed",
            });

            this.addDependencies(
                inputPath,
                result.loadedUrls.filter((url) => url.protocol === "file:").map((url) => fileURLToPath(url))
            );

            return result.css;
        };
    },
};
