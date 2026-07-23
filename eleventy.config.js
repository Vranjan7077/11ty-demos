import "dotenv/config";
import markdownItAnchor from "markdown-it-anchor";

import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import pluginReadingTime from "eleventy-plugin-reading-time";

import { sassExtension } from "./src/_11ty/sass.js";
import { registerFromGlob } from "./src/_11ty/registerFromGlob.js";

export default async function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/assets/images");
    eleventyConfig.addPassthroughCopy("src/assets/js");
    eleventyConfig.addPassthroughCopy("src/robots.txt");

    eleventyConfig.addTemplateFormats("scss");
    eleventyConfig.addExtension("scss", sassExtension);

    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginSyntaxHighlight);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(pluginReadingTime);

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
