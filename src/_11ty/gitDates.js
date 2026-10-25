import { execFileSync } from "node:child_process";

let commitDates = null;

function readCommitDates() {
    const dates = new Map();
    let output;
    try {
        output = execFileSync("git", ["log", "--format=%x00%cI", "--name-only", "--no-renames"], {
            encoding: "utf8",
            maxBuffer: 64 * 1024 * 1024,
            stdio: ["ignore", "pipe", "ignore"],
        });
    } catch {
        return dates;
    }

    let current = null;
    for (const line of output.split("\n")) {
        const value = line.trim();
        if (line.startsWith("\0")) {
            current = line.slice(1).trim();
        } else if (value && current && !dates.has(value)) {
            dates.set(value, current);
        }
    }
    return dates;
}

export function lastCommitDate(...files) {
    commitDates ??= readCommitDates();
    const dates = files
        .filter(Boolean)
        .map((file) => commitDates.get(file.replace(/^\.\//, "").replaceAll("\\", "/")))
        .filter(Boolean)
        .sort();
    return dates.at(-1) ?? null;
}
