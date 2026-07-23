import "./search.js";
import "./toc.js";
import "./view-counter.js";
import "./copy-code.js";

const themeToggles = document.querySelectorAll("[data-theme-toggle]");
const navToggle = document.querySelector("[data-nav-toggle]");
const primaryNav = document.getElementById("primary-nav");

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
        localStorage.setItem("theme", theme);
    } catch {}
}

themeToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        setTheme(current === "dark" ? "light" : "dark");
    });
});

navToggle?.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
});
