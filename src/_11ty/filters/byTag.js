export default function byTag(allDemos = [], tag) {
    return allDemos.filter((d) => (d.data.tags || []).includes(tag));
}
