import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  type?: string;
  image?: string;
}

export default function SEO({
  title,
  description = "Default description",
  type = "website",
  image,
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta name="twitter:card" content="summary_large_image" />}
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
