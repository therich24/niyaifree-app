/*
  NiYAIFREE Home Page — Noraure/Boake Book Store Style
  Clean white bg, coral red accent, book card grid with hover actions
  Sections: Announcement → Hero → Categories → Featured → Special Offer → Popular → Trust → Copyright
*/
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import BookCard from "@/components/BookCard";
import { toast } from "sonner";
import { BookOpen, ChevronRight, Star, Truck, Shield, Tag, RotateCcw, Sparkles, TrendingUp, Clock, Heart } from "lucide-react";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/hero-banner-dhg4wq4HwAVcainEMTnvn7.webp";
const PROMO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/promo-banner-9UxgNfesR6ZAXkdruvFDYS.webp";
const GENRE_IMGS: Record<string, string> = {
  "แฟนตาซี": "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-fantasy-cSCciZvfsbLSGWNbznjai7.webp",
  "โรแมนติก": "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-romance-hBdu4LhsQJxmiwTXbstpgW.webp",
  "แอ็คชั่น": "https://d2xsxph8kpxj0f.cloudfront.net/310519663414264641/crk9cv8BwHvaqTcJKtqHfc/genre-action-iSofNfva6rCFYnQYiBhL6u.webp",
};

const CATEGORIES = [
  { name: "แฟนตาซี", icon: "🐉" },
  { name: "โรแมนติก", icon: "💕" },
  { name: "แอ็คชั่น", icon: "⚔️" },
  { name: "ดราม่า", icon: "🎭" },
  { name: "สยองขวัญ", icon: "👻" },
  { name: "ลึกลับ", icon: "🔍" },
  { name: "ตลก", icon: "😂" },
  { name: "Sci-Fi", icon: "🚀" },
  { name: "จีนกำลังภายใน", icon: "🥋" },
  { name: "อิเซไก", icon: "🌀" },
];

export default function Home() {
  const [novels, setNovels] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("featured");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [novelsRes, featuredRes, popularRes, catRes] = await Promise.all([
        api.getNovels({ sort: "newest", limit: "8" }),
        api.getNovels({ featured: "true", limit: "8" }),
        api.getNovels({ sort: "popular", limit: "8" }),
        api.getCategories(),
      ]);
      setNovels(novelsRes.novels || []);
      setFeatured(featuredRes.novels || []);
      setPopular(popularRes.novels || []);
      setCategories(catRes || []);
    } catch (e: any) {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  const tabNovels = activeTab === "featured" ? featured : activeTab === "popular" ? popular : novels;

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="bg-primary text-white text-center py-2.5 text-sm font-medium tracking-wide">
        <div className="container flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>สมัครสมาชิกวันนี้ อ่านฟรี 7 วัน + รับแต้ม 100 แต้ม!</span>
          <Link href="/register" className="underline font-bold ml-2 hover:text-white/80">สมัครเลย →</Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white">
        <div className="container py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
                <BookOpen className="w-4 h-4" />
                แพลตฟอร์มอ่านนิยายฟรี
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight font-[Kanit] text-slate-900">
                อ่านนิยาย<br />
                <span className="text-primary">ฟรี</span> ทุกเรื่อง<br />
                ทุกที่ ทุกเวลา
              </h1>
              <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                คลังนิยายหลากหลายแนว อัปเดตทุกวัน อ่านฟรีไม่มีค่าใช้จ่าย
                สมัครสมาชิกรับสิทธิพิเศษมากมาย
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/search" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                  เริ่มอ่านเลย
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/register" className="inline-flex items-center gap-2 border-2 border-slate-300 text-slate-700 px-8 py-3.5 rounded-lg font-semibold text-lg hover:border-primary hover:text-primary transition-all">
                  สมัครสมาชิก
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-primary" /> 1,000+ เรื่อง</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> คุณภาพดี</span>
                <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-pink-400" /> ฟรี 100%</span>
              </div>
            </div>
            <div className="relative">
              <img src={HERO_IMG} alt="NiYAIFREE Hero" className="w-full rounded-2xl shadow-2xl" />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
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

      {/* Category Marquee */}
      <section className="py-8 border-y border-slate-100 bg-slate-50/50 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
            <Link key={i} href={`/genre/${cat.name}`} className="inline-flex items-center gap-2 mx-4 px-6 py-3 bg-white rounded-full shadow-sm border border-slate-100 hover:border-primary hover:shadow-md transition-all text-sm font-medium text-slate-700 hover:text-primary shrink-0">
              <span className="text-lg">{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Genre Cards */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="section-title">หมวดหมู่ยอดนิยม</h2>
          <p className="text-center text-slate-500 mb-10">เลือกอ่านนิยายตามแนวที่ชอบ</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link key={cat.name} href={`/genre/${cat.name}`} className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-slate-100">
                {GENRE_IMGS[cat.name] ? (
                  <img src={GENRE_IMGS[cat.name]} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-5xl">{cat.icon}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg font-[Kanit]">{cat.name}</h3>
                  <p className="text-white/70 text-sm">
                    {categories.find(c => c.category === cat.name)?.count || 0} เรื่อง
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            {CATEGORIES.slice(5).map((cat) => (
              <Link key={cat.name} href={`/genre/${cat.name}`} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-primary/5 hover:border-primary border border-transparent transition-all">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{cat.name}</p>
                  <p className="text-xs text-slate-500">{categories.find(c => c.category === cat.name)?.count || 0} เรื่อง</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Collections (Tabbed) */}
      <section className="py-16 bg-slate-50/50">
        <div className="container">
          <h2 className="section-title">คอลเลกชันยอดนิยม</h2>
          <p className="text-center text-slate-500 mb-8">เลือกอ่านนิยายคุณภาพ คัดสรรมาเพื่อคุณ</p>
          <div className="flex justify-center gap-2 mb-10">
            {[
              { key: "featured", label: "แนะนำ", icon: Star },
              { key: "popular", label: "ยอดนิยม", icon: TrendingUp },
              { key: "newest", label: "มาใหม่", icon: Clock },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-slate-200 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {tabNovels.slice(0, 8).map((novel: any) => (
                <BookCard key={novel.id} novel={novel} />
              ))}
            </div>
          )}

          {tabNovels.length === 0 && !loading && (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">ยังไม่มีนิยายในหมวดนี้</p>
            </div>
          )}
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={PROMO_IMG} alt="promo" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <img src={PROMO_IMG} alt="Special Offer" className="w-full max-w-md mx-auto rounded-2xl shadow-2xl" />
            </div>
            <div className="text-white space-y-6">
              <span className="inline-block bg-primary px-4 py-1 rounded-full text-sm font-bold">โปรโมชั่นพิเศษ</span>
              <h2 className="text-4xl lg:text-5xl font-bold font-[Kanit] leading-tight">
                สมัคร VIP<br />
                <span className="text-primary">฿100/เดือน</span>
              </h2>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs">✓</div>
                  อ่านนิยายยาวเกิน 30 ตอนได้ทุกเรื่อง
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs">✓</div>
                  โหลด eBook เป็นรูปเล่มได้ 10 เล่ม/เดือน
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs">✓</div>
                  ไม่มีโฆษณา อ่านสบายตา
                </li>
              </ul>
              <Link href="/vip" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all shadow-lg">
                สมัคร VIP เลย
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold font-[Kanit] text-slate-900">อัปเดตล่าสุด</h2>
              <p className="text-slate-500 mt-1">นิยายที่เพิ่งอัปเดตตอนใหม่</p>
            </div>
            <Link href="/search?sort=newest" className="text-primary font-semibold hover:underline flex items-center gap-1">
              ดูทั้งหมด <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-slate-200 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {novels.slice(0, 8).map((novel: any) => (
                <BookCard key={novel.id} novel={novel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-t border-slate-100 bg-slate-50/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "อ่านฟรี", desc: "นิยายฟรีมากมาย" },
              { icon: Shield, title: "ปลอดภัย", desc: "ระบบรักษาความปลอดภัย" },
              { icon: Tag, title: "ราคาดี", desc: "VIP เพียง ฿100/เดือน" },
              { icon: RotateCcw, title: "อัปเดตทุกวัน", desc: "เนื้อหาใหม่ทุกวัน" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-100">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <badge.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{badge.title}</p>
                  <p className="text-sm text-slate-500">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Copyright Warning */}
      <section className="py-8 bg-red-50/50">
        <div className="container">
          <div className="copyright-banner flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 mb-1">คำเตือนเรื่องลิขสิทธิ์</p>
              <p className="text-red-700 text-sm leading-relaxed">
                ห้ามกอปปี้ คัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ จำหน่าย โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท
                ตามกฎหมายลิขสิทธิ์ไทย พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537 ผู้ฝ่าฝืนมีโทษจำคุกไม่เกิน 4 ปี หรือปรับไม่เกิน 800,000 บาท หรือทั้งจำทั้งปรับ
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
