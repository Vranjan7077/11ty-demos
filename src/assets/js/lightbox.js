const galleries = document.querySelectorAll("[data-lightbox-gallery]");

const DIALOG_HTML = `
    <figure class="lightbox__figure">
        <img class="lightbox__image" alt="">
        <figcaption class="lightbox__caption"></figcaption>
    </figure>
    <p class="lightbox__counter" aria-live="polite"></p>
    <button type="button" class="lightbox__button lightbox__button--prev" data-lightbox-prev aria-label="Previous image">‹</button>
    <button type="button" class="lightbox__button lightbox__button--next" data-lightbox-next aria-label="Next image">›</button>
    <button type="button" class="lightbox__button lightbox__button--close" data-lightbox-close aria-label="Close" autofocus>×</button>
`;

if (galleries.length && typeof HTMLDialogElement === "function") {
    let dialog = null;
    let items = [];
    let index = 0;
    let opener = null;

    function show(nextIndex) {
        index = (nextIndex + items.length) % items.length;
        const link = items[index];
        const image = dialog.querySelector(".lightbox__image");
        const alt = link.querySelector("img")?.alt ?? "";

        image.src = link.dataset.full || link.href;
        image.alt = alt;
        image.width = Number(link.dataset.width) || 0;
        image.height = Number(link.dataset.height) || 0;
        dialog.querySelector(".lightbox__caption").textContent = alt;
        dialog.querySelector(".lightbox__counter").textContent = `${index + 1} of ${items.length}`;

        const single = items.length < 2;
        dialog.querySelector("[data-lightbox-prev]").hidden = single;
        dialog.querySelector("[data-lightbox-next]").hidden = single;
    }

    function build() {
        dialog = document.createElement("dialog");
        dialog.className = "lightbox";
        dialog.setAttribute("aria-label", "Image viewer");
        dialog.innerHTML = DIALOG_HTML;

        dialog.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(index - 1));
        dialog.querySelector("[data-lightbox-next]").addEventListener("click", () => show(index + 1));
        dialog.querySelector("[data-lightbox-close]").addEventListener("click", () => dialog.close());
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) dialog.close();
        });
        dialog.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") show(index + 1);
            if (event.key === "ArrowLeft") show(index - 1);
        });
        dialog.addEventListener("close", () => {
            dialog.querySelector(".lightbox__image").removeAttribute("src");
            opener?.focus();
        });

        document.body.append(dialog);
    }

    galleries.forEach((gallery) => {
        gallery.addEventListener("click", (event) => {
            const link = event.target.closest("[data-lightbox-item]");
            if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            if (!dialog) build();
            items = [...gallery.querySelectorAll("[data-lightbox-item]")];
            opener = link;
            show(items.indexOf(link));
            dialog.showModal();
        });
    });
}
