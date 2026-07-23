import fs from "node:fs";
import path from "node:path";

const languageByExtension = {
    njk: "markup",
    html: "markup",
    scss: "scss",
    css: "css",
    js: "js",
    mjs: "js",
    json: "json",
    md: "markdown",
    yml: "yaml",
};

export default function codeFile(filePath, start, end) {
    const absPath = path.join(process.cwd(), filePath);
    const raw = fs.readFileSync(absPath, "utf8");
    let lines = raw.split("\n");

    if (start) {
        const from = start - 1;
        const to = end || start;
        lines = lines.slice(from, to);
    }

    const code = lines.join("\n").replace(/\n+$/, "");
    const ext = path.extname(filePath).replace(".", "");
    const lang = languageByExtension[ext] || ext || "text";

    return `\n\n<p class="code-file__path"><code>${filePath}</code></p>\n\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
}
