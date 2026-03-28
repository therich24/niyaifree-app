/**
 * Design: Koparion Reborn — Green/Orange Book Shop
 * Layout: Hero → Categories → Featured → Popular → Latest → Promo
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { ChevronRight, Sparkles, TrendingUp, Clock, BookOpen, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/hero-banner-dhg4wq4HwAVcainEMTnvn7.webp";
const PROMO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/promo-banner-9UxgNfesR6ZAXkdruvFDYS.webp";

const GENRE_IMAGES: Record<string, string> = {
  "Fantasy": "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-fantasy-cSCciZvfsbLSGWNbznjai7.webp",
  "Romance": "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-romance-hBdu4LhsQJxmiwTXbstpgW.webp",
  "Action": "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-action-iSofNfva6rCFYnQYiBhL6u.webp",
};

const ALL_GENRES = [
  { name: "Romance", icon: "💕", color: "#E91E63" },
  { name: "CEO", icon: "👔", color: "#607D8B" },
  { name: "Mafia", icon: "🔫", color: "#37474F" },
  { name: "BL", icon: "🌈", color: "#9C27B0" },
  { name: "Fantasy", icon: "🐉", color: "#1B5E20" },
  { name: "System", icon: "⚡", color: "#FF6F00" },
  { name: "เกิดใหม่", icon: "🔄", color: "#00BCD4" },
  { name: "Horror", icon: "👻", color: "#B71C1C" },
  { name: "ดราม่า", icon: "🎭", color: "#5D4037" },
  { name: "คอมเมดี้", icon: "😂", color: "#FFC107" },
  { name: "ลึกลับ", icon: "🔍", color: "#3F51B5" },
  { name: "ผจญภัย", icon: "⚔️", color: "#FF5722" },
];

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ novels: 0, chapters: 0, views: 0, users: 0 });

  useEffect(() => {
    api.getNovels({ featured: "true", limit: "6" }).then(d => setFeatured(d.novels)).catch(() => {});
    api.getNovels({ sort: "popular", limit: "12" }).then(d => setPopular(d.novels)).catch(() => {});
    api.getNovels({ sort: "newest", limit: "12" }).then(d => { setLatest(d.novels); setStats(s => ({ ...s, novels: d.total })); }).catch(() => {});
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative h-[420px] md:h-[480px] overflow-hidden">
        <img src={HERO_BG} alt="NiYAIFREE Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.20 0.08 155 / 0.85), oklch(0.15 0.04 155 / 0.7))" }} />
        <div className="relative container h-full flex items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white mb-4" style={{ background: "oklch(0.72 0.16 60)" }}>
              <Sparkles className="w-3 h-3" /> อ่านฟรี 100% ไม่มีค่าใช้จ่าย
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "Kanit" }}>
              อ่านนิยายฟรี<br />
              <span style={{ color: "oklch(0.82 0.16 60)" }}>ครบทุกแนว ทุกอารมณ์</span>
            </h1>
            <p className="text-white/80 text-lg mb-6 leading-relaxed">
              Romance, Fantasy, BL, Horror และอีกมากมาย<br />
              อัปเดตทุกวัน กว่าหลายพันเรื่อง
            </p>
            <div className="flex gap-3">
              <Link href="/genre/popular">
                <Button size="lg" className="text-white font-semibold shadow-lg" style={{ background: "oklch(0.72 0.16 60)" }}>
                  <TrendingUp className="w-4 h-4 mr-2" /> เรื่องมาแรง
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 bg-transparent font-semibold">
                  สมัครฟรี
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-4 border-b" style={{ background: "oklch(0.97 0.005 155)" }}>
        <div className="container flex justify-center gap-8 md:gap-16 text-center">
          <div>
            <p className="text-2xl font-bold" style={{ fontFamily: "Kanit", color: "oklch(0.40 0.12 155)" }}>{stats.novels || "1,000"}+</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="w-3 h-3" /> เรื่อง</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ fontFamily: "Kanit", color: "oklch(0.40 0.12 155)" }}>30,000+</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" /> ตอน</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ fontFamily: "Kanit", color: "oklch(0.40 0.12 155)" }}>FREE</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> อ่านฟรี</p>
          </div>
        </div>
      </section>

      {/* ===== GENRE SECTION ===== */}
      <section className="py-10">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Kanit", color: "oklch(0.25 0.06 155)" }}>
              หมวดหมู่นิยาย
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
            {ALL_GENRES.map(g => {
              const count = categories.find((c: any) => c.category === g.name)?.count || 0;
              return (
                <Link key={g.name} href={`/genre/${encodeURIComponent(g.name)}`} className="no-underline">
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:shadow-md transition-all hover:-translate-y-1 bg-white border border-border/50">
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-xs font-semibold text-foreground" style={{ fontFamily: "Kanit" }}>{g.name}</span>
                    {count > 0 && <span className="text-[10px] text-muted-foreground">{count} เรื่อง</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== GENRE SHOWCASE (3 cards with images) ===== */}
      <section className="py-8" style={{ background: "oklch(0.96 0.005 85)" }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(GENRE_IMAGES).map(([name, img]) => (
              <Link key={name} href={`/genre/${encodeURIComponent(name)}`} className="no-underline">
                <div className="relative h-48 rounded-xl overflow-hidden group">
                  <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold" style={{ fontFamily: "Kanit" }}>{name}</h3>
                    <p className="text-sm text-white/80">ดูทั้งหมด</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      {featured.length > 0 && (
        <section className="py-10">
          <div className="container">
            <SectionHeader title="แนะนำสำหรับคุณ" icon={<Sparkles className="w-5 h-5" />} href="/genre/featured" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featured.map((n: any) => <BookCard key={n.id} novel={n} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== POPULAR ===== */}
      <section className="py-10" style={{ background: "oklch(0.97 0.005 155)" }}>
        <div className="container">
          <SectionHeader title="นิยายมาแรง" icon={<TrendingUp className="w-5 h-5" />} href="/genre/popular" color="oklch(0.72 0.16 60)" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popular.length > 0 ? popular.map((n: any) => <BookCard key={n.id} novel={n} />) : (
              Array.from({ length: 6 }).map((_, i) => <BookCardSkeleton key={i} />)
            )}
          </div>
        </div>
      </section>

      {/* ===== LATEST ===== */}
      <section className="py-10">
        <div className="container">
          <SectionHeader title="อัปเดตล่าสุด" icon={<Clock className="w-5 h-5" />} href="/genre/newest" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latest.length > 0 ? latest.map((n: any) => <BookCard key={n.id} novel={n} />) : (
              Array.from({ length: 6 }).map((_, i) => <BookCardSkeleton key={i} />)
            )}
          </div>
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="py-0">
        <div className="container">
          <div className="relative h-48 md:h-56 rounded-2xl overflow-hidden">
            <img src={PROMO_BG} alt="Promo" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, oklch(0.25 0.08 155 / 0.9), transparent)" }} />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "Kanit" }}>
                  สมัครสมาชิกฟรี
                </h2>
                <p className="text-white/80 mb-4">รับแต้มฟรี 100 แต้ม + อ่านฟรี 7 วัน</p>
                <Link href="/register">
                  <Button className="text-white font-semibold" style={{ background: "oklch(0.72 0.16 60)" }}>
                    สมัครเลย
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-8" />
    </div>
  );
}

function SectionHeader({ title, icon, href, color }: { title: string; icon: React.ReactNode; href: string; color?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md" style={{ background: (color || "oklch(0.40 0.12 155)") + " / 0.1", color: color || "oklch(0.40 0.12 155)" }}>
          {icon}
        </div>
        <h2 className="text-xl font-bold" style={{ fontFamily: "Kanit", color: "oklch(0.25 0.06 155)" }}>
          {title}
        </h2>
      </div>
      <Link href={href} className="text-sm font-medium flex items-center gap-1 no-underline" style={{ color: color || "oklch(0.40 0.12 155)" }}>
        ดูทั้งหมด <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function BookCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 rounded-lg bg-muted" />
      <div className="mt-2.5 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
