export default function toc(content = "") {
    const headingRegex = /<h([2-3])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
    const headings = [];
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
        const [, level, id, innerHtml] = match;
        const text = innerHtml.replace(/<[^>]*>/g, "").trim();
        headings.push({ level: Number(level), id, text });
    }
    return headings;
}
