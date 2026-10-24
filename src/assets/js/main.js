import "./search.js";
import "./toc.js";
import "./view-counter.js";
import "./copy-code.js";
import "./time-ago.js";
import "./demo-filter.js";
import "./reader-toggles.js";
import "./reading-position.js";
import "./back-to-top.js";
import "./navigation-status.js";
import "./lightbox.js";

const root = document.documentElement;
const themeToggles = document.querySelectorAll("[data-theme-toggle]");
const navToggle = document.querySelector("[data-nav-toggle]");
const primaryNav = document.getElementById("primary-nav");

const themeColor = document.querySelector('meta[name="theme-color"]');

function syncThemeToggles(theme) {
    themeToggles.forEach((toggle) => toggle.setAttribute("aria-pressed", String(theme === "dark")));
    themeColor?.setAttribute("content", themeColor.dataset[theme === "dark" ? "dark" : "light"]);
}

function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    syncThemeToggles(theme);
    try {
        localStorage.setItem("theme", theme);
    } catch {}
}

syncThemeToggles(root.getAttribute("data-theme"));

themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
        setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
});

function setNavOpen(isOpen) {
    primaryNav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
}

navToggle?.addEventListener("click", () => {
    setNavOpen(!primaryNav.classList.contains("is-open"));
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navToggle && primaryNav.classList.contains("is-open")) {
        setNavOpen(false);
        navToggle.focus();
    }
});
