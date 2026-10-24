import { run } from "node:test";
import fastGlob from "fast-glob";
import { fingerprintFiles } from "../_11ty/fingerprint.js";

const TESTED_SOURCES = ["test/*.test.js", "src/_11ty/**/*.js", "src/_data/site.js", "netlify/lib/**/*.js"];

async function runTests() {
    const testFiles = await fastGlob("test/*.test.js", { absolute: true });
    const stream = run({ files: testFiles.sort(), concurrency: true });

    let pass = 0;
    let fail = 0;
    const results = [];

    for await (const event of stream) {
        if (event.type === "test:pass") {
            pass++;
            results.push({ name: event.data.name, passed: true });
        }
        if (event.type === "test:fail") {
            fail++;
            results.push({ name: event.data.name, passed: false });
        }
    }

    return { pass, fail, total: pass + fail, results };
}

export default async function () {
    if (process.env.ELEVENTY_RUN_MODE === "build") {
        return runTests();
    }

    const fingerprint = fingerprintFiles(TESTED_SOURCES);
    const cached = globalThis.testResultsCache;
    if (cached?.fingerprint === fingerprint) {
        return cached.results;
    }

    const results = await runTests();
    globalThis.testResultsCache = { fingerprint, results };
    return results;
}
