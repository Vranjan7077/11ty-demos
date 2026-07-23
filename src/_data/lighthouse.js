import { createRequire } from "module";

const require = createRequire(import.meta.url);

export default async function () {
    return require("./lighthouseScores.json");
}
