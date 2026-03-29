/**
 * NiYAIFREE Dynamic Sitemap Generator
 * Generates sitemap.xml content from API data
 * Called at build time or served as a route
 */

const SITE_URL = "https://niyaifree.com";

const CATEGORIES = [
  "แฟนตาซี", "โรแมนติก", "แอ็คชั่น", "ดราม่า",
  "สยองขวัญ", "ลึกลับ", "Sci-Fi", "คอมเมดี้"
];

interface NovelForSitemap {
  slug: string;
  category: string;
  totalChapters: number;
  updatedAt?: string;
  createdAt?: string;
}

export function generateSitemapXml(novels: NovelForSitemap[]): string {
  const now = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Search -->
  <url>
    <loc>${SITE_URL}/search</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Categories -->
`;

  for (const cat of CATEGORIES) {
    xml += `  <url>
    <loc>${SITE_URL}/genre/${encodeURIComponent(cat)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // Novel pages
  for (const novel of novels) {
    const lastmod = (novel.updatedAt || novel.createdAt || now).split("T")[0];
    xml += `  <url>
    <loc>${SITE_URL}/novel/${encodeURIComponent(novel.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}
