import { readPreferences, writePreference, isEnabled } from "./preferences.js";

const root = document.documentElement;
const toggles = document.querySelectorAll("[data-reader-toggle]");

const apply = {
    css(enabled) {
        document.querySelectorAll('link[rel="stylesheet"], style').forEach((sheet) => {
            if (!sheet.hasAttribute("data-permanent")) sheet.disabled = !enabled;
        });
    },
    webFonts(enabled) {
        root.classList.toggle("font-fallback", !enabled);
    },
};

function sync(name, enabled) {
    toggles.forEach((toggle) => {
        if (toggle.dataset.readerToggle === name) toggle.setAttribute("aria-pressed", String(enabled));
    });
}

const preferences = readPreferences();
for (const name of Object.keys(apply)) {
    const enabled = isEnabled(preferences, name);
    apply[name](enabled);
    sync(name, enabled);
}

toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const name = toggle.dataset.readerToggle;
        const enabled = toggle.getAttribute("aria-pressed") !== "true";
        apply[name](enabled);
        sync(name, enabled);
        writePreference(name, enabled);
    });
});
