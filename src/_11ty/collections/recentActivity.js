export default function recentActivity(collectionApi) {
    const demos = collectionApi.getFilteredByGlob("src/demos/*.md");
    const posts = collectionApi.getFilteredByGlob("src/blog/*.md");
    return [...demos, ...posts].sort((a, b) => b.date - a.date);
}
