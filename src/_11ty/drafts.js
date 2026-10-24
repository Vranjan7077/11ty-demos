import fs from "node:fs";
import fg from "fast-glob";

export function shouldIncludeDrafts(env = process.env) {
    return env.ELEVENTY_RUN_MODE !== "build" || env.INCLUDE_DRAFTS === "true";
}

export function readFrontMatter(source) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return match ? match[1] : "";
}

export function isDraft(source) {
    return /^draft:\s*true\s*$/m.test(readFrontMatter(source));
}

export function findDrafts(patterns = ["src/demos/*.md", "src/blog/*.md"]) {
    return fg
        .sync(patterns)
        .sort()
        .map((file) => ({ file, source: fs.readFileSync(file, "utf8") }))
        .filter(({ source }) => isDraft(source))
        .map(({ file, source }) => ({
            file,
            title: readFrontMatter(source).match(/^title:\s*"?(.*?)"?\s*$/m)?.[1] ?? file,
            url: draftUrl(file),
        }));
}

export function draftUrl(file) {
    const [, section, slug] = file.match(/^src\/(demos|blog)\/([^/]+)\.md$/) ?? [];
    return section ? `/${section}/${slug}/` : null;
}
