export async function onRequest(context) {
  const { params, next } = context;

  const response = await next();

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Reuse the same logic: we need the levelSlug and submission ID for the image URL
  const imageUrl = `https://images.ultrakidle.online/${params.levelSlug}/${params.id}.jpg`;

  return new HTMLRewriter()
    .on('meta[property="og:image"]', { element: (el) => el.remove() })
    .on('meta[name="og:image"]', { element: (el) => el.remove() })
    .on('meta[property="twitter:image"]', { element: (el) => el.remove() })
    .on('meta[name="twitter:image"]', { element: (el) => el.remove() })
    .on('meta[property="twitter:card"]', { element: (el) => el.remove() })
    .on('meta[name="twitter:card"]', { element: (el) => el.remove() })
    .on("head", new ImageInjector(imageUrl))
    .transform(response);
}

class ImageInjector {
  constructor(imageUrl) {
    this.imageUrl = imageUrl;
  }

  element(element) {
    element.append(
      `<meta property="og:image" content="${this.imageUrl}" />`,
      { html: true }
    );
    element.append(
      `<meta name="twitter:image" content="${this.imageUrl}" />`,
      { html: true }
    );
    element.append(
      `<meta name="twitter:card" content="summary_large_image" />`,
      { html: true }
    );
  }
}
