const fallbackImage = "/games/placeholder.jpg";

export function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getGameImagePath(game) {
  if (game.image) return game.image;

  const baseName = game.slug || game.title;
  const slug = slugify(baseName);

  if (!slug) return fallbackImage;

  return `/games/${slug}.jpg`;
}