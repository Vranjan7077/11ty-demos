import site from "../../_data/site.js";

export default function repoUrl(filePath) {
    return `${site.repoUrl}/blob/${site.repoBranch}/${String(filePath).replace(/^\.\//, "")}`;
}
