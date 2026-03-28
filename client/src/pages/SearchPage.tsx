/**
 * Design: Koparion Reborn — Search page
 * Toast: error when search fails, warning for empty query, info for result count
 */
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SearchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, []);

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      toast.warning("กรุณาพิมพ์คำค้นหา");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.getNovels({ search: q.trim(), limit: "50" });
      setResults(data.novels);
      if (data.novels.length === 0) {
        toast.info(`ไม่พบผลลัพธ์สำหรับ "${q.trim()}"`);
      } else {
        toast.success(`พบ ${data.novels.length} ผลลัพธ์`);
      }
    } catch {
      setResults([]);
      toast.error("เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <div className="py-6 border-b" style={{ background: "oklch(0.97 0.005 155)" }}>
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground no-underline mb-4">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าแรก
          </Link>
          <form onSubmit={e => { e.preventDefault(); doSearch(query); }} className="flex gap-2 max-w-xl">
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="ค้นหานิยาย ชื่อเรื่อง หมวดหมู่..."
              className="flex-1 px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
            <Button type="submit" className="text-white" style={{ background: "oklch(0.40 0.12 155)" }} disabled={loading}>
              <Search className="w-4 h-4 mr-1" /> {loading ? "กำลังค้นหา..." : "ค้นหา"}
            </Button>
          </form>
        </div>
      </div>
      <section className="py-8">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse"><div className="h-56 rounded-lg bg-muted" /><div className="mt-2 h-4 bg-muted rounded w-3/4" /></div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">พบ {results.length} ผลลัพธ์</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.map((n: any) => <BookCard key={n.id} novel={n} />)}
              </div>
            </>
          ) : searched ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ไม่พบผลลัพธ์สำหรับ "{query}"</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
