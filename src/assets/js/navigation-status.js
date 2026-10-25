import { whenActivated } from "./when-activated.js";

const setText = (selector, text) => document.querySelectorAll(selector).forEach((el) => (el.textContent = text));

whenActivated(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsTransitions = "CSSViewTransitionRule" in window;
    setText(
        "[data-view-transition-status]",
        !supportsTransitions
            ? "Your browser doesn't support cross-page view transitions yet, so pages switch the normal way. Nothing breaks."
            : reducedMotion
              ? "Your browser supports cross-page view transitions, but you've asked for reduced motion, so this site turns them off for you."
              : "Your browser supports cross-page view transitions, so pages here fade into each other."
    );

    const navigation = performance.getEntriesByType?.("navigation")[0];
    const supportsSpeculation = HTMLScriptElement.supports?.("speculationrules") ?? false;
    setText(
        "[data-prerender-status]",
        !supportsSpeculation
            ? "Your browser doesn't support speculation rules, so pages load the normal way when you click. Nothing breaks."
            : navigation?.activationStart > 0
              ? `This page was prerendered: it started loading ${Math.round(navigation.activationStart)} ms before you clicked the link.`
              : "This page wasn't prerendered this time, which happens if you opened it directly, reloaded it, or clicked very quickly. Rest the pointer on one of the links below for a moment, then click it."
    );
});
