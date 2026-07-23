const toc = document.querySelector("[data-toc]");

if (toc && "IntersectionObserver" in window) {
    const links = [...toc.querySelectorAll("a[href^='#']")];
    const targets = links.map((link) => document.getElementById(link.getAttribute("href").slice(1))).filter(Boolean);

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const link = links.find((l) => l.getAttribute("href") === `#${entry.target.id}`);
                if (!link) continue;
                links.forEach((l) => l.parentElement.classList.remove("is-active"));
                link.parentElement.classList.add("is-active");
            }
        },
        { rootMargin: "0px 0px -70% 0px" }
    );

    targets.forEach((target) => observer.observe(target));
}
