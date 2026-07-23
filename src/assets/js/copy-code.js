const COPY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8" y="8" width="12" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 16H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 4h9A1.5 1.5 0 0 1 15.5 5.5V6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M7.5 12.5l3 3 6-6.5"/></svg>`;

if (navigator.clipboard) {
    document.querySelectorAll("pre").forEach((pre) => {
        const wrapper = document.createElement("div");
        wrapper.className = "code-block-wrapper";
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "copy-code-button";
        button.setAttribute("aria-label", "Copy code");
        button.innerHTML = COPY_ICON;
        wrapper.appendChild(button);

        button.addEventListener("click", async () => {
            const code = pre.querySelector("code") || pre;
            try {
                await navigator.clipboard.writeText(code.innerText);
                button.classList.add("is-copied");
                button.setAttribute("aria-label", "Copied");
                button.innerHTML = CHECK_ICON;
                setTimeout(() => {
                    button.classList.remove("is-copied");
                    button.setAttribute("aria-label", "Copy code");
                    button.innerHTML = COPY_ICON;
                }, 2000);
            } catch {}
        });
    });
}
