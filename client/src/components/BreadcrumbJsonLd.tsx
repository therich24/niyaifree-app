/*
  BreadcrumbJsonLd — Injects JSON-LD breadcrumb structured data into <head>
  For Google Search breadcrumb display
*/
import { useEffect } from "react";

const SITE_URL = "https://niyaifree.com";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  useEffect(() => {
    const id = "breadcrumb-jsonld";
    // Remove existing
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    if (!items || items.length === 0) return;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
      })),
    };

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [items]);

  return null;
}

// Also add Book structured data for novel pages
interface BookJsonLdProps {
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  category: string;
  url: string;
}

export function BookJsonLd({ title, author, description, coverUrl, category, url }: BookJsonLdProps) {
  useEffect(() => {
    const id = "book-jsonld";
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "Book",
      "name": title,
      "author": {
        "@type": "Person",
        "name": author,
      },
      "description": description,
      "genre": category,
      "url": url.startsWith("http") ? url : `${SITE_URL}${url}`,
      "inLanguage": "th",
      "publisher": {
        "@type": "Organization",
        "name": "NiYAIFREE",
        "url": SITE_URL,
      },
    };

    if (coverUrl) {
      jsonLd.image = coverUrl;
    }

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [title, author, description, coverUrl, category, url]);

  return null;
}
