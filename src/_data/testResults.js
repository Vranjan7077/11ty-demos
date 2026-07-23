import { run } from "node:test";
import path from "node:path";

export default async function () {
    const testFile = path.resolve(process.cwd(), "test/filters.test.js");
    const stream = run({ files: [testFile] });

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
