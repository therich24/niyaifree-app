/**
 * Design: Koparion Reborn — Genre listing page
 */
import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Genre() {
  const { name } = useParams<{ name: string }>();
  const [novels, setNovels] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [offset, setOffset] = useState(0);

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
    api.getNovels(params).then(d => { setNovels(d.novels); setTotal(d.total); }).catch(() => {}).finally(() => setLoading(false));
  }, [name, sort]);

  const loadMore = () => {
    const newOffset = offset + 24;
    const params: Record<string, string> = { limit: "24", offset: String(newOffset) };
    if (!isSpecial) { params.category = decodedName; params.sort = sort; }
    else if (decodedName === "popular") params.sort = "popular";
    else if (decodedName === "newest") params.sort = "newest";
    api.getNovels(params).then(d => { setNovels(prev => [...prev, ...d.novels]); setOffset(newOffset); }).catch(() => {});
  };

  const pageTitle = isSpecial
    ? decodedName === "popular" ? "นิยายมาแรง" : decodedName === "newest" ? "อัปเดตล่าสุด" : "แนะนำสำหรับคุณ"
    : `หมวดหมู่: ${decodedName}`;

  return (
    <div className="min-h-screen">
      <div className="py-4 border-b" style={{ background: "oklch(0.97 0.005 155)" }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground no-underline">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold" style={{ fontFamily: "Kanit", color: "oklch(0.25 0.06 155)" }}>
              {pageTitle}
            </h1>
            <span className="text-sm text-muted-foreground">({total} เรื่อง)</span>
          </div>
          {!isSpecial && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm border rounded-md px-2 py-1">
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
                  <div className="h-56 rounded-lg bg-muted" />
                  <div className="mt-2.5 space-y-2"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div>
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
                  <Button variant="outline" onClick={loadMore}>โหลดเพิ่ม</Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">ยังไม่มีนิยายในหมวดนี้</p>
              <Link href="/"><Button className="mt-4" variant="outline">กลับหน้าแรก</Button></Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
