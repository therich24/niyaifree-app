/*
  NiYAIFREE Sitemap — /sitemap.xml
  Generates and serves sitemap XML dynamically
*/
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { generateSitemapXml } from "@/lib/sitemap";

export default function Sitemap() {
  const [xml, setXml] = useState<string>("");

  useEffect(() => {
    api.getNovels({ limit: "500", sort: "latest" }).then((data: any) => {
      const novels = data.novels || [];
      const sitemapXml = generateSitemapXml(novels);
      setXml(sitemapXml);
    }).catch(() => {
      setXml("<!-- Error generating sitemap -->");
    });
  }, []);

  if (!xml) return <div style={{ fontFamily: "monospace", padding: 20 }}>Generating sitemap...</div>;

  return (
    <pre style={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap", padding: 20, background: "#f8f8f8" }}>
      {xml}
    </pre>
  );
}
