import timeAgo from "../../_11ty/filters/timeAgo.js";

document.querySelectorAll("[data-time-ago]").forEach((el) => {
    el.textContent = `${el.dataset.timeAgoPrefix || ""}${timeAgo(el.dataset.timeAgo)}`;
    el.hidden = false;
});
