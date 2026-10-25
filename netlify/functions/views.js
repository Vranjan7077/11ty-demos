import { getStore } from "@netlify/blobs";
import { createViewsHandler } from "../lib/view-counter.js";

export default createViewsHandler(getStore);
