/*
  NiYAIFREE Home — Bookworm Bookstore Style
  Blush hero, featured categories with colored cards, book grids, deals section
*/
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import BookCard from "@/components/BookCard";
import { api } from "@/lib/api";
import {
  BookOpen, TrendingUp, Clock, Star, ChevronRight,
  ArrowRight, Flame, Crown, Users, Sparkles, Zap, Heart
} from "lucide-react";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/hero-banner-P3KGaCtAhVoFcdmej49SAQ.webp";
const VIP_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/vip-section-bg-fhkESx7LZqPuVbVcVHTUqg.webp";
const PROMO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/promo-banner-bg-PMkLj77hVWxQ3jeeyryMNr.webp";
const NEWSLETTER_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/newsletter-bg-DBpMpEqgjSWDxZt2PfAWbW.webp";
const CATEGORY_DRAGON = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/category-fantasy-gcakKqsuNdMrToMgM4GEyk.webp";

const categories = [
  { name: "แฟนตาซี", icon: "🐉", bg: "cat-card-purple", desc: "โลกเวทมนตร์" },
  { name: "โรแมนติก", icon: "💕", bg: "cat-card-pink", desc: "ความรัก" },
  { name: "แอ็คชั่น", icon: "⚔️", bg: "cat-card-red", desc: "ต่อสู้" },
  { name: "ดราม่า", icon: "🎭", bg: "cat-card-yellow", desc: "ชีวิต" },
  { name: "สยองขวัญ", icon: "👻", bg: "cat-card-blue", desc: "สั่นประสาท" },
  { name: "ลึกลับ", icon: "🔍", bg: "cat-card-green", desc: "สืบสวน" },
  { name: "Sci-Fi", icon: "🚀", bg: "cat-card-orange", desc: "อนาคต" },
  { name: "คอมเมดี้", icon: "😂", bg: "cat-card-yellow", desc: "ตลก" },
];

const categoryColors: Record<string, string> = {
  "แฟนตาซี": "bg-purple-50 border-purple-200 text-purple-700",
  "โรแมนติก": "bg-pink-50 border-pink-200 text-pink-700",
  "แอ็คชั่น": "bg-red-50 border-red-200 text-red-700",
  "ดราม่า": "bg-yellow-50 border-yellow-200 text-yellow-700",
  "สยองขวัญ": "bg-blue-50 border-blue-200 text-blue-700",
  "ลึกลับ": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "Sci-Fi": "bg-orange-50 border-orange-200 text-orange-700",
  "คอมเมดี้": "bg-amber-50 border-amber-200 text-amber-700",
};

const categoryIcons: Record<string, string> = {
  "แฟนตาซี": "🐉",
  "โรแมนติก": "💕",
  "แอ็คชั่น": "⚔️",
  "ดราม่า": "🎭",
  "สยองขวัญ": "👻",
  "ลึกลับ": "🔍",
  "Sci-Fi": "🚀",
  "คอมเมดี้": "😂",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [novels, setNovels] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [categoryNovels, setCategoryNovels] = useState<Record<string, any[]>>({});
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [publicStats, setPublicStats] = useState<{ totalNovels: number; totalUsers: number; totalViews: number; totalChapters: number } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [novelsRes, trendingRes, featuredRes, statsRes] = await Promise.all([
          api.getNovels({ limit: "12", sort: "latest" }),
          api.getNovels({ limit: "10", sort: "popular" }),
          api.getNovels({ limit: "10", featured: "true" }),
          api.getPublicStats().catch(() => null),
        ]);
        setNovels(novelsRes.novels || []);
        setTrending(trendingRes.novels || []);
        setFeatured(featuredRes.novels || []);
        if (statsRes) setPublicStats(statsRes);

        // Load novels per category (6 each)
        const catPromises = categories.map(async (cat) => {
          try {
            const res = await api.getNovels({ limit: "6", category: cat.name });
            return { name: cat.name, novels: res.novels || [], total: res.total || 0 };
          } catch {
            return { name: cat.name, novels: [], total: 0 };
          }
        });
        const catResults = await Promise.all(catPromises);
        const catMap: Record<string, any[]> = {};
        const catTotals: Record<string, number> = {};
        catResults.forEach((r) => { catMap[r.name] = r.novels; catTotals[r.name] = r.total; });
        setCategoryNovels(catMap);
        setCategoryTotals(catTotals);
      } catch (e) {
        toast.error("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO SECTION — Bookworm Blush Style ===== */}
      <section className="hero-blush">
        <div className="container py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-5 relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-primary px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                <Sparkles className="w-4 h-4" />
                แพลตฟอร์มอ่านนิยายฟรี #1
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold font-[Kanit] text-slate-900 leading-[1.15]">
                นิยายที่คุณชอบ<br />
                <span className="text-primary">อ่านฟรี</span> ทุกวัน
              </h1>
              <p className="text-base lg:text-lg text-slate-600 max-w-md leading-relaxed">
                คลังนิยายหลากหลายแนว กว่า 1,000 เรื่อง อัปเดตทุกวัน
                อ่านฟรีไม่มีค่าใช้จ่าย สมัครสมาชิกรับสิทธิพิเศษ
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/search")}
                  className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  เริ่มอ่านเลย <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 bg-white text-slate-700 px-7 py-3 rounded-lg font-semibold border border-slate-200 hover:border-primary hover:text-primary transition-all"
                >
                  สมัครสมาชิก
                </button>
              </div>
              <div className="flex items-center gap-5 text-sm text-slate-500 pt-2">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary" /> {publicStats ? `${publicStats.totalNovels.toLocaleString()} เรื่อง` : "1,000+ เรื่อง"}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> {publicStats ? `${publicStats.totalUsers.toLocaleString()} สมาชิก` : "5,000+ สมาชิก"}</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-primary" /> ฟรี 100%</span>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src={HERO_IMG}
                  alt="NiYAIFREE Library"
                  className="w-full h-[240px] sm:h-[320px] lg:h-[420px] object-cover"
                />
              </div>
              <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 items-center gap-3 border border-slate-100">
                <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">ยอดอ่านวันนี้</p>
                  <p className="text-xs text-slate-500">{publicStats ? `${publicStats.totalViews.toLocaleString()} ครั้ง` : "10,000+ ครั้ง"}</p>
                </div>
              </div>
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 items-center gap-2 border border-slate-100">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                <span className="text-sm font-bold text-slate-900">4.8</span>
                <span className="text-xs text-slate-500">คะแนน</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED CATEGORIES — Bookworm Colored Cards ===== */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <img src={CATEGORY_DRAGON} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <h2 className="text-2xl font-bold font-[Kanit] text-slate-900">หมวดหมู่ยอดนิยม</h2>
            </div>
            <Link href="/search" className="text-primary text-sm font-semibold flex items-center gap-1 no-underline hover:underline">
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/genre/${cat.name}`}
                className={`${cat.bg} rounded-xl p-4 text-center no-underline group hover:shadow-md transition-all`}
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-semibold text-slate-800 font-[Kanit] block">{cat.name}</span>
                <span className="text-[10px] text-slate-500">{cat.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED / นิยายแนะนำ ===== */}
      {featured.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50">
          <div className="container">
            <div className="section-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-[Kanit] text-slate-900">นิยายแนะนำ</h2>
                  <p className="text-sm text-slate-500">คัดสรรโดยทีมงาน</p>
                </div>
              </div>
              <Link href="/genre/featured" className="text-primary text-sm font-semibold flex items-center gap-1 no-underline hover:underline">
                ดูทั้งหมด <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {featured.map((novel) => (
                <BookCard key={novel.id} novel={novel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TRENDING TOP 10 ===== */}
      <section className="py-12 bg-slate-50">
        <div className="container">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-[Kanit] text-slate-900">นิยายมาแรง TOP 10</h2>
                <p className="text-sm text-slate-500">เรื่องยอดนิยมที่มีคนดูสูงสุด</p>
              </div>
            </div>
            <Link href="/search?sort=popular" className="text-primary text-sm font-semibold flex items-center gap-1 no-underline hover:underline">
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-xl aspect-[3/4]" />
                  <div className="mt-3 h-4 bg-slate-200 rounded w-3/4" />
                  <div className="mt-2 h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {trending.map((novel, idx) => (
                <div key={novel.id} className="relative">
                  {idx < 3 && (
                    <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-slate-400" : "bg-amber-700"}`}>
                      {idx + 1}
                    </div>
                  )}
                  {idx >= 3 && (
                    <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-slate-600 text-white text-sm font-bold shadow-lg">
                      {idx + 1}
                    </div>
                  )}
                  <BookCard novel={novel} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">ยังไม่มีนิยายในระบบ</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== EACH CATEGORY — 6 novels per category ===== */}
      {categories.map((cat) => {
        const catNovels = categoryNovels[cat.name] || [];
        if (catNovels.length === 0 && !loading) return null;
        const colors = categoryColors[cat.name] || "bg-slate-50 border-slate-200 text-slate-700";
        const icon = categoryIcons[cat.name] || "📚";

        return (
          <section key={cat.name} className="py-10 bg-white border-t border-slate-100">
            <div className="container">
              <div className="section-header">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colors}`}>
                    <span className="text-xl">{icon}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-[Kanit] text-slate-900">{cat.name}</h2>
                    <p className="text-sm text-slate-500">{cat.desc} — {categoryTotals[cat.name] || catNovels.length} เรื่อง</p>
                  </div>
                </div>
                <Link href={`/genre/${cat.name}`} className="text-primary text-sm font-semibold flex items-center gap-1 no-underline hover:underline">
                  ดูทั้งหมด <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-slate-200 rounded-xl aspect-[3/4]" />
                      <div className="mt-3 h-4 bg-slate-200 rounded w-3/4" />
                      <div className="mt-2 h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {catNovels.map((novel) => (
                    <BookCard key={novel.id} novel={novel} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ===== NEW RELEASES / LATEST ===== */}
      <section className="py-12 bg-slate-50">
        <div className="container">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-[Kanit] text-slate-900">อัปเดตล่าสุด</h2>
                <p className="text-sm text-slate-500">นิยายที่เพิ่งเพิ่มเข้ามาใหม่</p>
              </div>
            </div>
            <Link href="/search?sort=latest" className="text-primary text-sm font-semibold flex items-center gap-1 no-underline hover:underline">
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-xl aspect-[3/4]" />
                  <div className="mt-3 h-4 bg-slate-200 rounded w-3/4" />
                  <div className="mt-2 h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : novels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {novels.map((novel) => (
                <BookCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">ยังไม่มีนิยายในระบบ</p>
              <p className="text-sm">กรุณาเพิ่มนิยายผ่าน Admin Panel</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== VIP & COINS — Moved to bottom ===== */}
      <section className="py-14 relative overflow-hidden">
        <img src={VIP_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/80" />
        <div className="container relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-[Kanit] text-slate-900 mb-2">สิทธิพิเศษสำหรับคุณ</h2>
            <p className="text-slate-500">อัปเกรดเพื่อรับประสบการณ์การอ่านที่ดีที่สุด</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* VIP Card */}
            <div className="bg-white rounded-2xl p-6 border-2 border-primary/20 shadow-md hover:shadow-lg hover:border-primary/40 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-[Kanit] text-slate-900">VIP Member</h3>
                    <p className="text-sm text-slate-500">฿100 / เดือน</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary shrink-0" /> อ่านนิยายยาว 30+ ตอนได้ทุกเรื่อง</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary shrink-0" /> ดาวน์โหลด eBook ได้ 10 เล่ม/เดือน</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary shrink-0" /> ไม่มีโฆษณา</li>
                </ul>
                <Link href="/vip" className="block text-center bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors no-underline shadow-sm">
                  สมัคร VIP
                </Link>
              </div>
            </div>

            {/* Coins Card */}
            <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-md hover:shadow-lg hover:border-amber-300 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-[Kanit] text-slate-900">Coins</h3>
                    <p className="text-sm text-slate-500">เริ่มต้น ฿100</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500 shrink-0" /> ดาวน์โหลด eBook 10 Coins/เล่ม</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500 shrink-0" /> ใช้ได้ไม่มีวันหมดอายุ</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500 shrink-0" /> ซื้อเท่าไหร่ก็ได้</li>
                </ul>
                <Link href="/coins" className="block text-center bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors no-underline shadow-sm">
                  ซื้อ Coins
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="relative py-14 overflow-hidden">
        <img src={PROMO_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/40" />
        <div className="container text-center relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold font-[Kanit] text-slate-900 mb-3">อ่านฟรี ไม่มีค่าใช้จ่าย</h3>
          <p className="text-slate-600 mb-5">สมัครสมาชิกวันนี้ รับแต้ม 100 แต้มทันที + อ่านฟรี 7 วัน</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all no-underline shadow-lg shadow-primary/20">
            สมัครเลย <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: BookOpen, label: "นิยายทั้งหมด", value: publicStats ? publicStats.totalNovels.toLocaleString() + " เรื่อง" : "1,000+ เรื่อง", color: "text-primary bg-primary/10" },
              { icon: Users, label: "สมาชิก", value: publicStats ? publicStats.totalUsers.toLocaleString() + " คน" : "5,000+ คน", color: "text-emerald-600 bg-emerald-50" },
              { icon: TrendingUp, label: "ยอดอ่านทั้งหมด", value: publicStats ? publicStats.totalViews.toLocaleString() : "10,000+", color: "text-blue-600 bg-blue-50" },
              { icon: Star, label: "ฟรี 100%", value: "ฟรี", color: "text-amber-600 bg-amber-50" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-5 rounded-xl bg-slate-50 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-xl font-bold font-[Kanit] text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
