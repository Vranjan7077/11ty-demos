import "dotenv/config";
import markdownItAnchor from "markdown-it-anchor";

import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import pluginReadingTime from "eleventy-plugin-reading-time";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import { sassExtension } from "./src/_11ty/sass.js";
import { bundleScripts } from "./src/_11ty/scripts.js";
import { writeCspHeaders } from "./src/_11ty/csp.js";
import { shouldIncludeDrafts } from "./src/_11ty/drafts.js";
import { clearFingerprintCache } from "./src/_11ty/fingerprint.js";
import { writeFavicons } from "./src/_11ty/favicons.js";
import { IMAGE_TRANSFORM_OPTIONS } from "./src/_11ty/imageTransformOptions.js";
import { registerFromGlob } from "./src/_11ty/registerFromGlob.js";

export default async function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/assets/images");
    eleventyConfig.addPassthroughCopy("src/assets/fonts");
    eleventyConfig.addPassthroughCopy("src/robots.txt");

    eleventyConfig.addWatchTarget("src/_11ty/**/*.js", { resetConfig: true });
    eleventyConfig.addWatchTarget("src/assets/js/");
    eleventyConfig.addWatchTarget("test/*.test.js");
    eleventyConfig.addWatchTarget("netlify/lib/");
    eleventyConfig.on("eleventy.before", async ({ directories, runMode }) => {
        clearFingerprintCache();
        await bundleScripts({ outdir: `${directories.output}assets/js`, minify: runMode === "build" });
        await writeFavicons(directories.output);
    });
    eleventyConfig.on("eleventy.after", async ({ directories, runMode }) => {
        if (runMode === "build") await writeCspHeaders(directories.output);
    });

    eleventyConfig.addTemplateFormats("scss");
    eleventyConfig.addExtension("scss", sassExtension);

    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginSyntaxHighlight);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(pluginReadingTime);
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, IMAGE_TRANSFORM_OPTIONS);

    eleventyConfig.addPreprocessor("drafts", "*", (data) => {
        if (data.draft && !shouldIncludeDrafts()) return false;
    });

    eleventyConfig.amendLibrary("md", (mdLib) =>
        mdLib
            .set({ html: true, breaks: false, linkify: true, typographer: true })
            .use(markdownItAnchor, { level: [2, 3, 4] })
    );

    await registerFromGlob(eleventyConfig, "src/_11ty/filters/*.js", (cfg, name, fn) => cfg.addFilter(name, fn));
    await registerFromGlob(eleventyConfig, "src/_11ty/shortcodes/*.js", (cfg, name, fn) => cfg.addShortcode(name, fn));
    await registerFromGlob(eleventyConfig, "src/_11ty/collections/*.js", (cfg, name, fn) =>
        cfg.addCollection(name, fn)
    );
    await registerFromGlob(eleventyConfig, "src/_11ty/transforms/*.js", (cfg, name, fn) => cfg.addTransform(name, fn));

    eleventyConfig.setServerOptions({
        port: 3000,
        liveReload: true,
        domDiff: true,
    });

    return {
        dir: {
            input: "src",
            output: "public",
            data: "_data",
            includes: "_includes",
        },
        templateFormats: ["njk", "md", "scss", "11ty.js"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
    };
}
