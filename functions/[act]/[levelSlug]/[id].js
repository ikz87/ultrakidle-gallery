export async function onRequest(context) {
  const { params, next } = context;

  const response = await next();

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const imageUrl = buildImageUrl(params.levelSlug, params.id);
  if (!imageUrl) {
    return response;
  }

  return new HTMLRewriter()
    // Strip out all potential existing image and card tags
    .on('meta[property="og:image"]', { element: (el) => el.remove() })
    .on('meta[name="og:image"]', { element: (el) => el.remove() })
    .on('meta[property="twitter:image"]', { element: (el) => el.remove() })
    .on('meta[name="twitter:image"]', { element: (el) => el.remove() })
    .on('meta[property="twitter:card"]', { element: (el) => el.remove() })
    .on('meta[name="twitter:card"]', { element: (el) => el.remove() })
    .on("head", new ImageInjector(imageUrl))
    .transform(response);
}

function buildImageUrl(levelSlug, id) {
  if (!/^\d+$/.test(id)) return null;

  const parts = String(levelSlug).split("-");
  if (parts.length < 2) return null;

  const levelNumber = `${parts[0]}-${parts[1]}`;
  if (!/^[a-z0-9]+-[a-z0-9]+$/i.test(levelNumber)) return null;

  return `https://images.ultrakidle.online/${levelNumber}/${id}.jpg`;
}

class ImageInjector {
  constructor(imageUrl) {
    this.imageUrl = imageUrl;
  }

  element(element) {
    element.append(
      `<meta property="og:image" content="${this.imageUrl}" />`,
      { html: true },
    );
    element.append(
      `<meta name="twitter:image" content="${this.imageUrl}" />`,
      { html: true },
    );
    element.append(
      `<meta name="twitter:card" content="summary_large_image" />`,
      { html: true },
    );
  }
}
