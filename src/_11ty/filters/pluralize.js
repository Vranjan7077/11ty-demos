export default function pluralize(count, singular, plural) {
    const word = count === 1 ? singular : plural || `${singular}s`;
    return `${count} ${word}`;
}
