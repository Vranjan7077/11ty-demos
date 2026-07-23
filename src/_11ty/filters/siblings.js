export default function siblings(allItems = [], currentUrl) {
    const index = allItems.findIndex((item) => item.url === currentUrl);
    return {
        prev: index > 0 ? allItems[index - 1] : null,
        next: index >= 0 && index < allItems.length - 1 ? allItems[index + 1] : null,
    };
}
