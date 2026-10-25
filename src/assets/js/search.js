const searchRoots = document.querySelectorAll("[data-search]");
let indexRequest = null;

function loadIndex() {
    indexRequest ??= fetch("/search-index.json")
        .then((response) => {
            if (!response.ok) throw new Error(`search index responded with ${response.status}`);
            return response.json();
        })
        .catch((error) => {
            indexRequest = null;
            throw error;
        });
    return indexRequest;
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

function findMatches(items, query) {
    const tokens = query.split(/\s+/).filter(Boolean);
    return items
        .map((item) => ({ item, score: scoreItem(item, tokens) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((entry) => entry.item);
}

function createResult(item) {
    const li = document.createElement("li");
    li.className = "search-result";
    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.title;
    const description = document.createElement("p");
    description.textContent = item.description;
    li.append(link, description);
    return li;
}

function setupSearch(searchRoot) {
    const input = searchRoot.querySelector("[data-search-input]");
    const resultsList = searchRoot.querySelector("[data-search-results]");
    const status = searchRoot.querySelector("[data-search-status]");
    const resultLinks = () => [...resultsList.querySelectorAll("a")];
    const currentQuery = () => input.value.trim().toLowerCase();

    function announce(text) {
        if (status) status.textContent = text;
    }

    function close() {
        resultsList.hidden = true;
    }

    function showMessage(text) {
        const li = document.createElement("li");
        li.className = "search__empty";
        li.textContent = text;
        resultsList.replaceChildren(li);
        resultsList.hidden = false;
        announce(text);
    }

    async function update() {
        const query = currentQuery();
        if (!query) {
            resultsList.replaceChildren();
            close();
            announce("");
            return;
        }

        let items;
        try {
            items = await loadIndex();
        } catch {
            showMessage("Search is unavailable right now.");
            return;
        }
        if (currentQuery() !== query) return;

        const matches = findMatches(items, query);
        if (!matches.length) {
            showMessage("No matches.");
            return;
        }

        resultsList.replaceChildren(...matches.map(createResult));
        resultsList.hidden = false;
        announce(`${matches.length} ${matches.length === 1 ? "result" : "results"}. Use the down arrow to browse.`);
    }

    input.addEventListener("input", update);

    input.addEventListener("focus", () => {
        if (currentQuery() && resultsList.children.length) resultsList.hidden = false;
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" && !resultsList.hidden) {
            const first = resultLinks()[0];
            if (first) {
                event.preventDefault();
                first.focus();
            }
        } else if (event.key === "Escape" && !resultsList.hidden) {
            event.preventDefault();
            close();
        }
    });

    resultsList.addEventListener("keydown", (event) => {
        const links = resultLinks();
        const index = links.indexOf(document.activeElement);
        if (event.key === "ArrowDown") {
            event.preventDefault();
            links[Math.min(index + 1, links.length - 1)]?.focus();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            (index <= 0 ? input : links[index - 1]).focus();
        } else if (event.key === "Escape") {
            event.preventDefault();
            close();
            input.focus();
        }
    });

    searchRoot.addEventListener("focusout", (event) => {
        if (!searchRoot.contains(event.relatedTarget)) close();
    });

    document.addEventListener("click", (event) => {
        if (!searchRoot.contains(event.target)) close();
    });
}

searchRoots.forEach(setupSearch);
