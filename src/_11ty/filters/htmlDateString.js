export default function htmlDateString(dateObj) {
    return new Date(dateObj).toISOString().slice(0, 10);
}
