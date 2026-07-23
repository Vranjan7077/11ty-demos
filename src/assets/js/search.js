const searchRoots = document.querySelectorAll("[data-search]");

if (searchRoots.length) {
    let index = null;

    async function loadIndex() {
        if (index) return index;
        const response = await fetch("/search-index.json");
        index = await response.json();
        return index;
    }

    function scoreItem(item, tokens) {
        const title = item.title.toLowerCase();
        const description = item.description.toLowerCase();
        const tags = item.tags.join(" ").toLowerCase();

        let score = 0;
        for (const token of tokens) {
            if (title.includes(token)) score += 3;
            if (tags.includes(token)) score += 2;
            if (description.includes(token)) score += 1;
        }
        return score;
    }

    function renderResults(resultsList, items) {
        resultsList.innerHTML = "";

        if (!items.length) {
            resultsList.innerHTML = '<li class="search__empty">No matches.</li>';
            resultsList.hidden = false;
            return;
        }

        for (const item of items) {
            const li = document.createElement("li");
            li.className = "search-result";
            li.innerHTML = `<a href="${item.url}">${item.title}</a><p>${item.description}</p>`;
            resultsList.appendChild(li);
        }
        resultsList.hidden = false;
    }

    searchRoots.forEach((searchRoot) => {
        const input = searchRoot.querySelector("[data-search-input]");
        const resultsList = searchRoot.querySelector("[data-search-results]");

        input.addEventListener("input", async () => {
            const query = input.value.trim().toLowerCase();

            if (!query) {
                resultsList.hidden = true;
                resultsList.innerHTML = "";
                return;
            }

            const items = await loadIndex();
            const tokens = query.split(/\s+/).filter(Boolean);

            const matches = items
                .map((item) => ({ item, score: scoreItem(item, tokens) }))
                .filter((entry) => entry.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 8)
                .map((entry) => entry.item);

            renderResults(resultsList, matches);
        });

        document.addEventListener("click", (event) => {
            if (!searchRoot.contains(event.target)) {
                resultsList.hidden = true;
            }
        });
    });
}
