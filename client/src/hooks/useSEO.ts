import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  canonical?: string;
  keywords?: string;
  noindex?: boolean;
}

const SITE_NAME = "NiYAIFREE";
const DEFAULT_TITLE = "NiYAIFREE — อ่านนิยายฟรี ครบทุกแนว";
const DEFAULT_DESC = "อ่านนิยายฟรี ครบทุกแนว อัปเดตทุกวัน แฟนตาซี โรแมนติก แอ็คชั่น ดราม่า สยองขวัญ ลึกลับ Sci-Fi คอมเมดี้ และอีกมากมาย | niyaifree.com";
const DEFAULT_OG_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/hero-banner-P3KGaCtAhVoFcdmej49SAQ.webp";
const SITE_URL = "https://niyaifree.com";

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function useSEO(options: SEOOptions = {}) {
  useEffect(() => {
    const {
      title,
      description = DEFAULT_DESC,
      ogTitle,
      ogDescription,
      ogImage = DEFAULT_OG_IMAGE,
      ogUrl,
      ogType = "website",
      canonical,
      keywords,
      noindex = false,
    } = options;

    // Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;

    // Meta description
    setMeta("description", description);

    // Keywords
    if (keywords) {
      setMeta("keywords", keywords);
    }

    // Robots
    if (noindex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow");
    }

    // Open Graph
    setMeta("og:title", ogTitle || fullTitle, true);
    setMeta("og:description", ogDescription || description, true);
    setMeta("og:image", ogImage, true);
    setMeta("og:type", ogType, true);
    setMeta("og:site_name", SITE_NAME, true);
    if (ogUrl) {
      setMeta("og:url", ogUrl, true);
    }
    setMeta("og:locale", "th_TH", true);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", ogTitle || fullTitle, true);
    setMeta("twitter:description", ogDescription || description, true);
    setMeta("twitter:image", ogImage, true);

    // Canonical
    if (canonical) {
      setLink("canonical", canonical);
    }

    // Cleanup: restore default title when unmounting
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [
    options.title,
    options.description,
    options.ogTitle,
    options.ogDescription,
    options.ogImage,
    options.ogUrl,
    options.ogType,
    options.canonical,
    options.keywords,
    options.noindex,
  ]);
}

export { SITE_NAME, SITE_URL, DEFAULT_TITLE, DEFAULT_DESC, DEFAULT_OG_IMAGE };
