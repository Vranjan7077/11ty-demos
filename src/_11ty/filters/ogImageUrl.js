import { cardHash, cardInputs } from "../shortcodes/ogImage.js";

export default function ogImageUrl(title, description, eyebrow, thumbnail) {
    return `/assets/images/og/${cardHash(cardInputs({ title, description, eyebrow, thumbnail }))}.png`;
}
