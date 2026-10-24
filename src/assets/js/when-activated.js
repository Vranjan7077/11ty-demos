export function whenActivated(callback) {
    if (document.prerendering) {
        document.addEventListener("prerenderingchange", callback, { once: true });
    } else {
        callback();
    }
}
