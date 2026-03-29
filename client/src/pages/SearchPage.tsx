/*
  NiYAIFREE Advanced Search — Filters: หมวดหมู่, สถานะ, จำนวนตอน, Age Rating
*/
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { Search, ArrowLeft, Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSEO, SITE_URL } from "@/hooks/useSEO";

const CATEGORIES = [
  { value: "", label: "ทุกหมวดหมู่" },
  { value: "Romance", label: "Romance" },
  { value: "CEO", label: "CEO" },
  { value: "Mafia", label: "Mafia" },
  { value: "BL", label: "BL" },
  { value: "Fantasy", label: "แฟนตาซี" },
  { value: "System", label: "ระบบ" },
  { value: "เกิดใหม่", label: "เกิดใหม่" },
  { value: "Horror", label: "สยองขวัญ" },
  { value: "ดราม่า", label: "ดราม่า" },
  { value: "คอมเมดี้", label: "คอมเมดี้" },
  { value: "ลึกลับ", label: "ลึกลับ" },
  { value: "ผจญภัย", label: "ผจญภัย" },
];

const STATUSES = [
  { value: "", label: "ทุกสถานะ" },
  { value: "published", label: "เผยแพร่" },
  { value: "completed", label: "จบแล้ว" },
  { value: "writing", label: "กำลังเขียน" },
  { value: "draft", label: "แบบร่าง" },
];

const CHAPTER_RANGES = [
  { value: "", label: "ทุกจำนวนตอน" },
  { value: "1-10", label: "1-10 ตอน" },
  { value: "11-30", label: "11-30 ตอน" },
  { value: "31-50", label: "31-50 ตอน" },
  { value: "51+", label: "51+ ตอน" },
];

const AGE_RATINGS = [
  { value: "", label: "ทุกเรท" },
  { value: "ทั่วไป", label: "ทั่วไป" },
  { value: "13+", label: "13+" },
  { value: "18+", label: "18+" },
  { value: "20+", label: "20+" },
];

const SORT_OPTIONS = [
  { value: "latest", label: "ล่าสุด" },
  { value: "popular", label: "ยอดนิยม" },
  { value: "az", label: "ก-ฮ" },
];

export default function SearchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);

  useSEO({
    title: initialQ ? `ค้นหา: ${initialQ}` : "ค้นหานิยาย",
    description: initialQ
      ? `ผลการค้นหา \"${initialQ}\" บน NiYAIFREE อ่านนิยายฟรีครบทุกแนว`
      : "ค้นหานิยายที่ชอบ กรองตามหมวดหมู่ สถานะ จำนวนตอน ที่ NiYAIFREE",
    canonical: `${SITE_URL}/search${initialQ ? `?q=${encodeURIComponent(initialQ)}` : ""}`,
    keywords: `ค้นหานิยาย, อ่านนิยายฟรี, niyaifree${initialQ ? `, ${initialQ}` : ""}`,
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterChapters, setFilterChapters] = useState("");
  const [filterAgeRating, setFilterAgeRating] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const activeFilterCount = [filterCategory, filterStatus, filterChapters, filterAgeRating].filter(Boolean).length;

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, []);

  const doSearch = async (q: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const params: Record<string, string> = { limit: "100", sort: sortBy };
      if (q.trim()) params.search = q.trim();
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      if (filterAgeRating) params.ageRating = filterAgeRating;
      const data = await api.getNovels(params);
      setResults(data.novels || []);
      if ((data.novels || []).length === 0) toast.info("ไม่พบผลลัพธ์");
      else toast.success(`พบ ${data.novels.length} ผลลัพธ์`);
    } catch {
      setResults([]);
      toast.error("เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่");
    }
    setLoading(false);
  };

  // Client-side filter for chapter ranges (since API may not support it)
  const filteredResults = useMemo(() => {
    let filtered = results;
    if (filterChapters) {
      if (filterChapters === "1-10") filtered = filtered.filter(n => (n.totalChapters || 0) >= 1 && (n.totalChapters || 0) <= 10);
      else if (filterChapters === "11-30") filtered = filtered.filter(n => (n.totalChapters || 0) >= 11 && (n.totalChapters || 0) <= 30);
      else if (filterChapters === "31-50") filtered = filtered.filter(n => (n.totalChapters || 0) >= 31 && (n.totalChapters || 0) <= 50);
      else if (filterChapters === "51+") filtered = filtered.filter(n => (n.totalChapters || 0) >= 51);
    }
    return filtered;
  }, [results, filterChapters]);

  const handleApplyFilters = () => {
    doSearch(query);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterCategory("");
    setFilterStatus("");
    setFilterChapters("");
    setFilterAgeRating("");
    setSortBy("latest");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-6 border-b border-slate-100 bg-slate-50">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary no-underline mb-4">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าแรก
          </Link>
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={e => { e.preventDefault(); doSearch(query); }} className="flex gap-2 flex-1 max-w-xl">
              <input
                type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="ค้นหานิยาย ชื่อเรื่อง หมวดหมู่..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoFocus
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={loading}>
                <Search className="w-4 h-4 mr-1" /> {loading ? "ค้นหา..." : "ค้นหา"}
              </Button>
            </form>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`relative ${showFilters ? 'border-primary text-primary' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1.5" />
              ตัวกรอง
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm font-[Kanit] text-slate-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" /> ค้นหาขั้นสูง
                </h3>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">หมวดหมู่</label>
                  <div className="relative">
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pr-8"
                    >
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">สถานะ</label>
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pr-8"
                    >
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Chapters */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">จำนวนตอน</label>
                  <div className="relative">
                    <select
                      value={filterChapters}
                      onChange={e => setFilterChapters(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pr-8"
                    >
                      {CHAPTER_RANGES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Age Rating */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">เรทอายุ</label>
                  <div className="relative">
                    <select
                      value={filterAgeRating}
                      onChange={e => setFilterAgeRating(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pr-8"
                    >
                      {AGE_RATINGS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">เรียงตาม</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none pr-8"
                    >
                      {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
                <Button onClick={handleApplyFilters} className="bg-primary hover:bg-primary/90 text-white">
                  <Search className="w-4 h-4 mr-1" /> ค้นหาด้วยตัวกรอง
                </Button>
                {activeFilterCount > 0 && (
                  <button onClick={handleClearFilters} className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> ล้างตัวกรอง
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {activeFilterCount > 0 && !showFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filterCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  {CATEGORIES.find(c => c.value === filterCategory)?.label}
                  <button onClick={() => { setFilterCategory(""); doSearch(query); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterStatus && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium">
                  {STATUSES.find(s => s.value === filterStatus)?.label}
                  <button onClick={() => { setFilterStatus(""); doSearch(query); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterChapters && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-600 text-xs rounded-full font-medium">
                  {CHAPTER_RANGES.find(c => c.value === filterChapters)?.label}
                  <button onClick={() => setFilterChapters("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterAgeRating && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 text-xs rounded-full font-medium">
                  เรท {filterAgeRating}
                  <button onClick={() => { setFilterAgeRating(""); doSearch(query); }}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <section className="py-8">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse"><div className="h-56 rounded-xl bg-slate-200" /><div className="mt-2 h-4 bg-slate-200 rounded w-3/4" /></div>
              ))}
            </div>
          ) : filteredResults.length > 0 ? (
            <>
              <p className="text-sm text-slate-500 mb-4">พบ {filteredResults.length} ผลลัพธ์</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredResults.map((n: any) => <BookCard key={n.id} novel={n} />)}
              </div>
            </>
          ) : searched ? (
            <div className="text-center py-20 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-[Kanit]">ไม่พบผลลัพธ์</p>
              <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-300">
              <SlidersHorizontal className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-[Kanit] text-slate-500 text-lg">ค้นหานิยายที่คุณชอบ</p>
              <p className="text-sm text-slate-400 mt-1">พิมพ์ชื่อเรื่อง หรือใช้ตัวกรองเพื่อค้นหา</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
