const viewCounter = document.querySelector("[data-view-counter]");

if (viewCounter) {
    const countEl = viewCounter.querySelector("[data-view-counter-count]");
    const key = viewCounter.dataset.viewCounterKey || "site";

    fetch(`/.netlify/functions/views?key=${encodeURIComponent(key)}`)
        .then((res) => {
            if (!res.ok) throw new Error("request failed");
            return res.json();
        })
        .then((data) => {
            countEl.textContent = data.views.toLocaleString("en-US");
        })
        .catch(() => {
            viewCounter.classList.add("is-unavailable");
            countEl.textContent = "unavailable";
        });
}
