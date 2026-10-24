import { whenActivated } from "./when-activated.js";

const viewCounter = document.querySelector("[data-view-counter]");

function readFlag(name) {
    try {
        return sessionStorage.getItem(name) === "1";
    } catch {
        return false;
    }
}

function writeFlag(name) {
    try {
        sessionStorage.setItem(name, "1");
    } catch {}
}

function countView() {
    const countEl = viewCounter.querySelector("[data-view-counter-count]");
    const key = viewCounter.dataset.viewCounterKey;
    const sessionFlag = `view-counted:${key}`;
    const alreadyCounted = readFlag(sessionFlag);

    fetch(`/.netlify/functions/views?key=${encodeURIComponent(key)}`, {
        method: alreadyCounted ? "GET" : "POST",
    })
        .then((res) => {
            if (!res.ok) throw new Error("request failed");
            return res.json();
        })
        .then((data) => {
            if (!alreadyCounted) writeFlag(sessionFlag);
            countEl.textContent = data.views.toLocaleString("en-US");
        })
        .catch(() => {
            viewCounter.classList.add("is-unavailable");
            countEl.textContent = "unavailable";
        });
}

if (viewCounter) whenActivated(countView);
