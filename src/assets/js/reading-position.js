import timeAgo from "../../_11ty/filters/timeAgo.js";
import { whenActivated } from "./when-activated.js";
import {
    MIN_PERCENT,
    readStore,
    writeStore,
    recordPosition,
    forget,
    resumableEntry,
    savedPositions,
    scrollPercent,
} from "./reading-position-store.js";

function storage() {
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const currentPercent = () =>
    scrollPercent({
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
    });

function focusFirstVisible(container, skip) {
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
    const target = [...container.querySelectorAll("h1, h2, h3, p, li, pre, figure")].find((el) => {
        if (skip?.contains(el) || el.closest("nav")) return false;
        const rect = el.getBoundingClientRect();
        return rect.height > 0 && rect.top >= headerBottom;
    });
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
}

function trackPage(article) {
    const key = window.location.pathname;
    const contentVersion = article.dataset.contentVersion;
    const title = document.querySelector("h1")?.textContent.trim() || document.title;
    const prompt = article.querySelector("[data-resume-reading]");
    const navigation = performance.getEntriesByType?.("navigation")[0];
    const isFreshVisit = !window.location.hash && (!navigation || navigation.type === "navigate");

    const offered = isFreshVisit
        ? resumableEntry(readStore(storage()), key, { contentVersion, now: Date.now() })
        : null;
    let offering = Boolean(offered && prompt);

    function save() {
        const percent = currentPercent();
        if (offering && percent < MIN_PERCENT) return;
        writeStore(
            storage(),
            recordPosition(readStore(storage()), key, { percent, title, contentVersion }, Date.now())
        );
    }

    function closePrompt() {
        offering = false;
        prompt.hidden = true;
    }

    if (offering) {
        prompt.querySelector("[data-resume-percent]").textContent = `${Math.round(offered.percent * 100)}%`;
        prompt.hidden = false;

        prompt.querySelector("[data-resume-go]").addEventListener("click", () => {
            closePrompt();
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const behavior = prefersReducedMotion() ? "auto" : "smooth";
            window.scrollTo({ top: Math.round(offered.percent * max), behavior });
            window.setTimeout(() => focusFirstVisible(article, prompt), behavior === "smooth" ? 600 : 0);
        });

        prompt.querySelector("[data-resume-dismiss]").addEventListener("click", () => {
            closePrompt();
            writeStore(storage(), forget(readStore(storage()), key));
            focusFirstVisible(article, prompt);
        });
    }

    let timer = null;
    window.addEventListener(
        "scroll",
        () => {
            if (offering && currentPercent() > 0.1) closePrompt();
            if (timer) return;
            timer = window.setTimeout(() => {
                timer = null;
                save();
            }, 1000);
        },
        { passive: true }
    );
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") save();
    });
}

function renderSavedList(container) {
    const items = container.querySelector("[data-reading-list-items]");
    const empty = container.querySelector("[data-reading-list-empty]");
    const clear = container.querySelector("[data-reading-list-clear]");

    function render() {
        const positions = savedPositions(readStore(storage()), Date.now()).filter(
            (entry) => entry.path !== window.location.pathname
        );
        items.replaceChildren(
            ...positions.map((entry) => {
                const li = document.createElement("li");
                const link = document.createElement("a");
                link.href = entry.path;
                link.textContent = entry.title || entry.path;
                li.append(link, ` — ${Math.round(entry.percent * 100)}% through, saved ${timeAgo(entry.updatedAt)}`);
                return li;
            })
        );
        empty.hidden = positions.length > 0;
        clear.hidden = positions.length === 0;
    }

    clear.addEventListener("click", () => {
        writeStore(storage(), { v: 1, pages: {} });
        render();
        empty.focus();
    });

    container.hidden = false;
    render();
}

if (storage()) {
    const article = document.querySelector("[data-reading-position]");
    if (article) whenActivated(() => trackPage(article));

    const list = document.querySelector("[data-reading-list]");
    if (list) renderSavedList(list);
}
