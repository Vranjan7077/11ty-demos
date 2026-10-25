import Fetch from "@11ty/eleventy-fetch";

export async function fetchPexelsPhotos(endpoint, count) {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        throw new Error("PEXELS_API_KEY is not set");
    }

    const separator = endpoint.includes("?") ? "&" : "?";
    const data = await Fetch(`https://api.pexels.com/v1/${endpoint}${separator}per_page=${count}`, {
        duration: "1d",
        type: "json",
        fetchOptions: { headers: { Authorization: apiKey } },
    });

    return data.photos.map((photo) => ({
        url: photo.src.large,
        alt: photo.alt || `Photo by ${photo.photographer} on Pexels`,
    }));
}
