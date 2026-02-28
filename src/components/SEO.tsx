import { Helmet } from "react-helmet-async";

const SITE_URL = "https://brand.aldenairperfumes.de";
const SITE_NAME = "BuildYourBrand";
const DEFAULT_OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3df431bc-fe9a-403d-a050-b60012790536/id-preview-da3749dc--b937d4ec-1d78-48b9-bb4d-ab44d9c298c7.lovable.app-1771978657390.png";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  lang?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  type?: "website" | "article";
  breadcrumbs?: { name: string; url: string }[];
}

export function SEO({
  title,
  description,
  path,
  lang = "de",
  noindex = false,
  jsonLd,
  author = "BuildYourBrand",
  publishedDate,
  modifiedDate,
  type = "website",
  breadcrumbs,
}: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;

  // BreadcrumbList schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((bc, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: bc.name,
          item: bc.url.startsWith("http") ? bc.url : `${SITE_URL}${bc.url}`,
        })),
      }
    : null;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="de_DE" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      <meta name="twitter:creator" content="@buildyourbrand" />

      {/* Article metadata */}
      {type === "article" && publishedDate && (
        <meta property="article:published_time" content={publishedDate} />
      )}
      {type === "article" && modifiedDate && (
        <meta property="article:modified_time" content={modifiedDate} />
      )}
      {type === "article" && (
        <meta property="article:author" content={author} />
      )}

      {/* Author */}
      <meta name="author" content={author} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
