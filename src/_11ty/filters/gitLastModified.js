import { lastCommitDate } from "../gitDates.js";

export default function gitLastModified(inputPath, demoBlock) {
    const date = lastCommitDate(inputPath, demoBlock && `src/_includes/${demoBlock}`);
    return date ? date.slice(0, 10) : "";
}
