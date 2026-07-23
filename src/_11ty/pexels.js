const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function fetchPexelsPhotos(endpoint, count) {
    if (!PEXELS_API_KEY) {
        throw new Error("PEXELS_API_KEY is not set");
    }

    const separator = endpoint.includes("?") ? "&" : "?";
    const response = await fetch(`https://api.pexels.com/v1/${endpoint}${separator}per_page=${count}`, {
        headers: { Authorization: PEXELS_API_KEY },
    });

    if (!response.ok) {
        throw new Error(`Pexels API responded with ${response.status}`);
    }

    const data = await response.json();
    return data.photos.map((photo) => ({
        url: photo.src.large,
        alt: photo.alt || `Photo by ${photo.photographer} on Pexels`,
    }));
}
