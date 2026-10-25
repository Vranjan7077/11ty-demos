import { createHash } from "node:crypto";

export default function shortHash(value) {
    return createHash("sha256")
        .update(String(value ?? ""))
        .digest("hex")
        .slice(0, 8);
}
