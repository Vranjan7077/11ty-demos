export default function excerpt(text, wordLimit = 20) {
    const words = String(text).trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return `${words.slice(0, wordLimit).join(" ")}…`;
}
