import * as esbuild from "esbuild";

export async function bundleScripts({ outdir, minify = true }) {
    await esbuild.build({
        entryPoints: ["src/assets/js/main.js"],
        outdir,
        bundle: true,
        format: "esm",
        target: "es2020",
        minify,
        sourcemap: minify ? false : "inline",
        logLevel: "warning",
    });
}
