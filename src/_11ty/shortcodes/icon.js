import fs from "node:fs";
import path from "node:path";

export default function icon(name, className) {
    const filePath = path.join(process.cwd(), "src/assets/icons", `${name}.svg`);
    const raw = fs.readFileSync(filePath, "utf8");
    return className ? raw.replace("<svg", `<svg class="${className}"`) : raw;
}
