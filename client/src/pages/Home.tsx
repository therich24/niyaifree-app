/*
  NiYAIFREE Home — Koparion Book Shop Style + Coral Red Theme
  Hero banner left/right split, genre categories, trending novels, latest updates
*/
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import BookCard from "@/components/BookCard";
import { api } from "@/lib/api";
import {
  BookOpen, TrendingUp, Clock, Star, ChevronRight,
  Sparkles, ArrowRight, Flame, Crown, Users
} from "lucide-react";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/hero-banner-dhg4wq4HwAVcainEMTnvn7.webp";
const GENRE_FANTASY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-fantasy-cSCciZvfsbLSGWNbznjai7.webp";
const GENRE_ROMANCE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-romance-hBdu4LhsQJxmiwTXbstpgW.webp";
const GENRE_ACTION = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-action-iSofNfva6rCFYnQYiBhL6u.webp";
const PROMO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/promo-banner-9UxgNfesR6ZAXkdruvFDYS.webp";

const genres = [
  { name: "แฟนตาซี", icon: "🐉", img: GENRE_FANTASY, color: "from-indigo-500 to-purple-600" },
  { name: "โรแมนติก", icon: "💕", img: GENRE_ROMANCE, color: "from-pink-500 to-rose-600" },
  { name: "แอ็คชั่น", icon: "⚔️", img: GENRE_ACTION, color: "from-orange-500 to-red-600" },
  { name: "ดราม่า", icon: "🎭", color: "from-amber-500 to-orange-600" },
  { name: "สยองขวัญ", icon: "👻", color: "from-gray-700 to-gray-900" },
  { name: "ลึกลับ", icon: "🔍", color: "from-teal-500 to-emerald-600" },
  { name: "Sci-Fi", icon: "🚀", color: "from-cyan-500 to-blue-600" },
  { name: "คอมเมดี้", icon: "😂", color: "from-yellow-400 to-amber-500" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [novels, setNovels] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [novelsRes, trendingRes] = await Promise.all([
          api.getNovels({ limit: "12", sort: "latest" }),
          api.getNovels({ limit: "8", sort: "popular" }),
        ]);
        setNovels(novelsRes.novels || []);
        setTrending(trendingRes.novels || []);
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
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                <BookOpen className="w-4 h-4" />
                แพลตฟอร์มอ่านนิยายฟรี
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[Kanit] text-slate-900 leading-tight">
                อ่านนิยาย{" "}
                <span className="text-primary">ฟรี</span>{" "}
                ทุกเรื่อง<br />
                ทุกที่ ทุกเวลา
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                คลังนิยายหลากหลายแนว อัปเดตทุกวัน อ่านฟรีไม่มีค่าใช้จ่าย
                สมัครสมาชิกรับสิทธิพิเศษมากมาย
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/search")}
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                >
                  เริ่มอ่านเลย <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 bg-white text-slate-700 px-8 py-3.5 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-primary hover:text-primary transition-all"
                >
                  สมัครสมาชิก
                </button>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> 1,000+ เรื่อง</span>
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> คุณภาพดี</span>
                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> ฟรี 100%</span>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={HERO_IMG}
                  alt="NiYAIFREE Library"
                  className="w-full h-[350px] lg:h-[450px] object-cover"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3 border border-slate-100">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">ยอดอ่านวันนี้</p>
                  <p className="text-xs text-slate-500">10,000+ ครั้ง</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GENRE CATEGORIES ===== */}
      <section className="py-14 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-[Kanit] text-slate-900">หมวดหมู่นิยาย</h2>
              <div className="section-divider mt-2" />
            </div>
            <Link href="/search" className="text-primary text-sm font-semibold flex items-center gap-1 no-underline hover:underline">
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {genres.map((g) => (
              <Link
                key={g.name}
                href={`/genre/${g.name}`}
                className="genre-pill group relative rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center no-underline"
              >
                {g.img ? (
                  <img src={g.img} alt={g.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${g.color}`} />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                <span className="relative text-3xl mb-1">{g.icon}</span>
                <span className="relative text-white font-bold text-sm font-[Kanit]">{g.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRENDING / POPULAR ===== */}
      <section className="py-14 bg-slate-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-[Kanit] text-slate-900">นิยายมาแรง</h2>
                <p className="text-sm text-slate-500">เรื่องยอดนิยมที่ทุกคนกำลังอ่าน</p>
              </div>
            </div>
            <Link href="/search?sort=popular" className="text-primary text-sm font-semibold flex items-center gap-1 no-underline hover:underline">
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-xl aspect-[3/4]" />
                  <div className="mt-3 h-4 bg-slate-200 rounded w-3/4" />
                  <div className="mt-2 h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {trending.map((novel) => (
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

      {/* ===== LATEST UPDATES ===== */}
      <section className="py-14 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-xl aspect-[3/4]" />
                  <div className="mt-3 h-4 bg-slate-200 rounded w-3/4" />
                  <div className="mt-2 h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : novels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
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

      {/* ===== VIP PROMO BANNER ===== */}
      <section className="py-14 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={PROMO_IMG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Crown className="w-4 h-4" />
              สมาชิก VIP
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-[Kanit] mb-4">
              อัปเกรดเป็น VIP วันนี้
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              อ่านนิยายยาว 30+ ตอนได้ทุกเรื่อง โหลด eBook ได้ 10 เล่ม/เดือน
              เพียง ฿100/เดือน
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/vip"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg no-underline"
              >
                <Crown className="w-5 h-5" /> สมัคร VIP
              </Link>
              <Link
                href="/coins"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20 no-underline"
              >
                ซื้อ Coins
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-14 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, label: "นิยายทั้งหมด", value: "1,000+", color: "text-primary bg-primary/10" },
              { icon: Users, label: "สมาชิก", value: "5,000+", color: "text-emerald-600 bg-emerald-50" },
              { icon: TrendingUp, label: "ยอดอ่าน/วัน", value: "10,000+", color: "text-blue-600 bg-blue-50" },
              { icon: Star, label: "คะแนนเฉลี่ย", value: "4.8/5", color: "text-amber-600 bg-amber-50" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <p className="text-2xl font-bold font-[Kanit] text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
