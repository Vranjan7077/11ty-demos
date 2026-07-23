export default function demosToItemList(demos, baseUrl) {
    return demos.map((demo, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}${demo.url}`,
        name: demo.data.title,
    }));
}
