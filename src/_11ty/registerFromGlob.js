import path from "node:path";
import { pathToFileURL } from "node:url";
import fg from "fast-glob";

export async function registerFromGlob(eleventyConfig, pattern, register) {
    const files = await fg(pattern, { absolute: true });

    for (const file of files) {
        const name = path.basename(file, path.extname(file));
        const mod = await import(pathToFileURL(file).href);
        register(eleventyConfig, name, mod.default);
    }
}
