const link = document.querySelector("[data-back-to-top]");
const main = document.getElementById("main");

if (link && main) {
    let ticking = false;
    const update = () => {
        link.hidden = window.scrollY < window.innerHeight * 1.5;
        ticking = false;
    };

    window.addEventListener(
        "scroll",
        () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        },
        { passive: true }
    );

    link.addEventListener("click", (event) => {
        event.preventDefault();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        main.focus({ preventScroll: true });
    });

    document.querySelectorAll("[data-back-to-top-threshold]").forEach((el) => {
        el.textContent = `${Math.round(window.innerHeight * 1.5)}px`;
    });

    update();
}
