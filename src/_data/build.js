export default function () {
    const env = process.env;
    return {
        builtAt: new Date().toISOString(),
        commit: env.COMMIT_REF ? env.COMMIT_REF.slice(0, 7) : null,
        context: env.CONTEXT || (env.NETLIFY ? "unknown" : "local"),
        hookTitle: env.INCOMING_HOOK_TITLE || null,
    };
}
