export default function demoTags(collectionApi) {
    const items = collectionApi.getFilteredByGlob("src/demos/*.md");
    const tagSet = new Set();
    items.forEach((demo) => {
        (demo.data.tags || []).forEach((tag) => {
            if (tag !== "demo") tagSet.add(tag);
        });
    });
    return [...tagSet].sort();
}
