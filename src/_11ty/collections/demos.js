export default function demos(collectionApi) {
    return collectionApi.getFilteredByGlob("src/demos/*.md").sort((a, b) => {
        const orderA = a.data.order ?? 999;
        const orderB = b.data.order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return a.data.title.localeCompare(b.data.title);
    });
}
