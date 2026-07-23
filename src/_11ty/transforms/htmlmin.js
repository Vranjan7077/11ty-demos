import { minify } from "html-minifier-terser";

const OPTIONS = {
    useShortDoctype: true,
    removeComments: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyCSS: true,
    minifyJS: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    collapseBooleanAttributes: true,
    removeEmptyAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    decodeEntities: true,
    processConditionalComments: true,
};

export default async function htmlmin(content, outputPath) {
    if (process.env.ELEVENTY_RUN_MODE === "serve") return content;
    if (!outputPath || !outputPath.endsWith(".html")) return content;

    try {
        const minified = await minify(content, OPTIONS);
        if (!minified || minified.length < content.length * 0.1) {
            console.warn(`[htmlmin] Suspicious output for ${outputPath}, using original`);
            return content;
        }
        return minified;
    } catch (error) {
        console.error(`[htmlmin] Failed on ${outputPath}:`, error.message);
        return content;
    }
}
