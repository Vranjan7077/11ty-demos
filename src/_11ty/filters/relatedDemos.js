export default function relatedDemos(allDemos = [], currentUrl, currentTags = [], limit = 3) {
    const tagSet = new Set((currentTags || []).filter((t) => t !== "demo"));
    return allDemos
        .filter((d) => d.url !== currentUrl)
        .map((d) => {
            const tags = (d.data.tags || []).filter((t) => t !== "demo");
            const shared = tags.filter((t) => tagSet.has(t)).length;
            return { demo: d, shared };
        })
        .filter((x) => x.shared > 0)
        .sort((a, b) => b.shared - a.shared)
        .slice(0, limit)
        .map((x) => x.demo);
}
