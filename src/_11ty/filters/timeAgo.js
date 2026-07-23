import pluralize from "./pluralize.js";

const UNITS = [
    ["year", 31536000000],
    ["month", 2592000000],
    ["week", 604800000],
    ["day", 86400000],
];

export default function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();

    for (const [unit, ms] of UNITS) {
        const value = Math.floor(diff / ms);
        if (value >= 1) {
            return `${pluralize(value, unit)} ago`;
        }
    }

    return "today";
}
