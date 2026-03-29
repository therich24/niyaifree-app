/*
  NiYAIFREE Genre — Koparion Style + Coral Red
*/
import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSEO, SITE_URL } from "@/hooks/useSEO";

export default function Genre() {
  const { name } = useParams<{ name: string }>();
  const [novels, setNovels] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const decodedName = decodeURIComponent(name || "");
  const isSpecial = ["popular", "newest", "featured"].includes(decodedName);

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    const params: Record<string, string> = { limit: "24", offset: "0" };
    if (isSpecial) {
      if (decodedName === "popular") params.sort = "popular";
      else if (decodedName === "newest") params.sort = "newest";
      else if (decodedName === "featured") params.featured = "true";
    } else {
      params.category = decodedName;
      params.sort = sort;
    }
    api.getNovels(params)
      .then(d => { setNovels(d.novels); setTotal(d.total); })
      .catch(() => toast.error("ไม่สามารถโหลดข้อมูลนิยายได้"))
      .finally(() => setLoading(false));
  }, [name, sort]);

  const loadMore = () => {
    setLoadingMore(true);
    const newOffset = offset + 24;
    const params: Record<string, string> = { limit: "24", offset: String(newOffset) };
    if (!isSpecial) { params.category = decodedName; params.sort = sort; }
    else if (decodedName === "popular") params.sort = "popular";
    else if (decodedName === "newest") params.sort = "newest";
    api.getNovels(params)
      .then(d => { setNovels(prev => [...prev, ...d.novels]); setOffset(newOffset); toast.info(`โหลดเพิ่ม ${d.novels.length} เรื่อง`); })
      .catch(() => toast.error("ไม่สามารถโหลดเพิ่มได้"))
      .finally(() => setLoadingMore(false));
  };

  const pageTitle = isSpecial
    ? decodedName === "popular" ? "นิยายมาแรง" : decodedName === "newest" ? "อัปเดตล่าสุด" : "แนะนำสำหรับคุณ"
    : `หมวดหมู่: ${decodedName}`;

  // SEO
  const seoTitle = isSpecial
    ? decodedName === "popular" ? "นิยายยอดนิยม อ่านฟรี" : decodedName === "newest" ? "นิยายอัปเดตล่าสุด" : "นิยายแนะนำ"
    : `นิยาย${decodedName} อ่านฟรี ${total} เรื่อง`;
  useSEO({
    title: seoTitle,
    description: isSpecial
      ? `${seoTitle} ที่ NiYAIFREE อ่านฟรีไม่มีค่าใช้จ่าย`
      : `อ่านนิยาย${decodedName}ฟรี ${total} เรื่อง อัปเดตทุกวัน ที่ NiYAIFREE`,
    canonical: `${SITE_URL}/genre/${encodeURIComponent(decodedName)}`,
    ogUrl: `${SITE_URL}/genre/${encodeURIComponent(decodedName)}`,
    keywords: `นิยาย${decodedName}, อ่านนิยายฟรี, ${decodedName}, niyaifree`,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="py-4 border-b border-slate-100 bg-slate-50">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-primary no-underline">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold font-[Kanit] text-slate-900">{pageTitle}</h1>
            <span className="text-sm text-slate-400">({total} เรื่อง)</span>
          </div>
          {!isSpecial && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="popular">ยอดนิยม</option>
                <option value="newest">ล่าสุด</option>
                <option value="updated">อัปเดตล่าสุด</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <section className="py-8">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-56 rounded-xl bg-slate-200" />
                  <div className="mt-2.5 space-y-2"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-200 rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : novels.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {novels.map((n: any) => <BookCard key={n.id} novel={n} />)}
              </div>
              {novels.length < total && (
                <div className="text-center mt-8">
                  <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="border-slate-200 hover:border-primary hover:text-primary">
                    {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg">ยังไม่มีนิยายในหมวดนี้</p>
              <Link href="/"><Button className="mt-4" variant="outline">กลับหน้าแรก</Button></Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
