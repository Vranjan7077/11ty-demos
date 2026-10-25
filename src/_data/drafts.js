import { findDrafts, shouldIncludeDrafts } from "../_11ty/drafts.js";

export default function () {
    return {
        included: shouldIncludeDrafts(),
        files: findDrafts(),
    };
}
