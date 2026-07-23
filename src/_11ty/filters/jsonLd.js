export default function jsonLd(value) {
    return JSON.stringify(value).replace(/</g, "\\u003C");
}
