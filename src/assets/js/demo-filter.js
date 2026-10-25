const form = document.querySelector("[data-demo-filter]");

if (form) {
    const cards = [...document.querySelectorAll("[data-demo-card]")];
    const status = form.querySelector("[data-demo-filter-status]");
    const fields = ["tag", "difficulty"];

    const params = new URLSearchParams(window.location.search);
    for (const name of fields) {
        const value = params.get(name);
        const select = form.elements[name];
        if (value && [...select.options].some((option) => option.value === value)) {
            select.value = value;
        }
    }

    function apply() {
        const tag = form.elements.tag.value;
        const difficulty = form.elements.difficulty.value;

        let shown = 0;
        for (const card of cards) {
            const matches =
                (!tag || card.dataset.tags.split(" ").includes(tag)) &&
                (!difficulty || card.dataset.difficulty === difficulty);
            card.hidden = !matches;
            if (matches) shown++;
        }

        status.textContent = shown ? `Showing ${shown} of ${cards.length} demos` : "No demos match these filters.";

        const url = new URL(window.location.href);
        for (const name of fields) {
            const value = form.elements[name].value;
            if (value) url.searchParams.set(name, value);
            else url.searchParams.delete(name);
        }
        window.history.replaceState(null, "", url);
    }

    form.addEventListener("change", apply);
    form.addEventListener("submit", (event) => event.preventDefault());
    apply();
}
