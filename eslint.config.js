import js from "@eslint/js";
import globals from "globals";

export default [
    { ignores: ["public/**", "node_modules/**"] },
    js.configs.recommended,
    {
        files: ["eleventy.config.js", "src/_11ty/**/*.js", "src/_data/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.node },
        },
    },
    {
        files: ["netlify/functions/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.node, Response: "readonly", Request: "readonly", URL: "readonly", fetch: "readonly" },
        },
    },
    {
        files: ["src/assets/js/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.browser },
        },
        rules: {
            "no-empty": ["error", { allowEmptyCatch: true }],
        },
    },
];
