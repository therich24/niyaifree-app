/*
  NiYAIFREE Reader — Koparion Style + Coral Red
*/
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, ArrowLeft, Settings2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSEO, SITE_URL } from "@/hooks/useSEO";

const BG_COLORS = [
  { name: "ขาว", value: "#FFFFFF" },
  { name: "ครีม", value: "#FFF8E7" },
  { name: "เขียวอ่อน", value: "#F0F7F0" },
  { name: "เทาอ่อน", value: "#F5F5F5" },
  { name: "น้ำตาลอ่อน", value: "#F5E6D3" },
  { name: "ดำ", value: "#1A1A1A" },
];

export default function Reader() {
  const { novelId, chapterNumber } = useParams<{ novelId: string; chapterNumber: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [chapter, setChapter] = useState<any>(null);
  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bgColor, setBgColor] = useState(localStorage.getItem("reader_bg") || "#FFFFFF");
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("reader_fs") || "18"));
  const [showSettings, setShowSettings] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  const isDark = bgColor === "#1A1A1A";
  const textColor = isDark ? "#E0E0E0" : "#2D2D2D";

  // SEO: Dynamic title for reading page
  useSEO(chapter && novel ? {
    title: `${novel.title} ตอนที่ ${chapterNumber} ${chapter.title ? `— ${chapter.title}` : ""}`,
    description: `อ่าน ${novel.title} ตอนที่ ${chapterNumber} ${chapter.title || ""} ฟรีที่ NiYAIFREE หมวด${novel.category || ""}`,
    ogTitle: `${novel.title} ตอนที่ ${chapterNumber}`,
    ogImage: novel.coverUrl || undefined,
    ogUrl: `${SITE_URL}/read/${novelId}/${chapterNumber}`,
    canonical: `${SITE_URL}/read/${novelId}/${chapterNumber}`,
    keywords: `${novel.title}, ตอนที่ ${chapterNumber}, อ่านนิยายฟรี, niyaifree`,
  } : {});

  useEffect(() => {
    if (novelId && chapterNumber) {
      setLoading(true);
      startTime.current = Date.now();
      Promise.all([
        api.getChapter(parseInt(novelId), parseInt(chapterNumber)),
        api.getNovel(novelId)
      ])
        .then(([ch, nv]) => { setChapter(ch); setNovel(nv); })
        .catch(() => toast.error("ไม่พบตอนนี้"))
        .finally(() => setLoading(false));
    }
  }, [novelId, chapterNumber]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const scrollTop = window.scrollY - el.offsetTop;
      const scrollHeight = el.scrollHeight - window.innerHeight;
      const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      setProgress(pct);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (user && chapter) {
        const duration = Math.floor((Date.now() - startTime.current) / 1000);
        api.logRead({
          novelId: parseInt(novelId!),
          chapterId: chapter.id,
          chapterNumber: parseInt(chapterNumber!),
          duration,
          progress
        }).catch(() => {});
      }
    };
  }, [user, chapter, progress]);

  const saveBg = (c: string) => { setBgColor(c); localStorage.setItem("reader_bg", c); toast.success("เปลี่ยนสีพื้นหลังแล้ว", { duration: 1500 }); };
  const saveFs = (s: number) => { setFontSize(s); localStorage.setItem("reader_fs", String(s)); };

  const goChapter = (num: number) => {
    window.scrollTo(0, 0);
    toast.info(`กำลังโหลดตอนที่ ${num}...`, { duration: 1500 });
    setLocation(`/read/${novelId}/${num}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!chapter) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-slate-400 mb-4">ไม่พบตอนนี้</p>
        <Link href="/"><Button className="bg-primary text-white">กลับหน้าแรก</Button></Link>
      </div>
    </div>
  );

  const chNum = parseInt(chapterNumber!);

  return (
    <div className="min-h-screen" style={{ background: bgColor, color: textColor }}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200">
        <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Top nav */}
      <div className="sticky top-1 z-40 backdrop-blur-md border-b" style={{ background: isDark ? "rgba(26,26,26,0.95)" : "rgba(255,255,255,0.95)", borderColor: isDark ? "#333" : "#e5e5e5" }}>
        <div className="container flex items-center justify-between h-12">
          <Link href={`/novel/${novelId}`} className="flex items-center gap-1 text-sm text-primary no-underline hover:underline">
            <ArrowLeft className="w-4 h-4" /> กลับ
          </Link>
          <div className="flex flex-col items-center truncate max-w-[60%]">
            <Link href={`/novel/${novelId}`} className="text-xs text-primary hover:underline truncate max-w-full no-underline">
              {novel?.title || "กลับหน้าเรื่อง"}
            </Link>
            <span className="text-sm font-medium font-[Kanit]">
              ตอนที่ {chNum}
            </span>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-md hover:bg-black/5">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {showSettings && (
          <div className="border-t p-4 space-y-4" style={{ borderColor: isDark ? "#333" : "#e5e5e5" }}>
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1"><Palette className="w-3 h-3" /> สีพื้นหลัง</p>
              <div className="flex gap-2">
                {BG_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => saveBg(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${bgColor === c.value ? "border-primary scale-110" : "border-gray-300"}`}
                    style={{ background: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">ขนาดตัวอักษร: {fontSize}px</p>
              <div className="flex items-center gap-3">
                <button onClick={() => saveFs(Math.max(14, fontSize - 2))} className="w-8 h-8 rounded border flex items-center justify-center text-sm font-bold">A-</button>
                <input type="range" min="14" max="28" value={fontSize} onChange={e => saveFs(parseInt(e.target.value))} className="flex-1 accent-primary" />
                <button onClick={() => saveFs(Math.min(28, fontSize + 2))} className="w-8 h-8 rounded border flex items-center justify-center text-sm font-bold">A+</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} className="container max-w-3xl py-8">
        <h1 className="text-xl md:text-2xl font-bold font-[Kanit] mb-6 text-center">
          {chapter.title || `ตอนที่ ${chNum}`}
        </h1>

        <div className="leading-loose whitespace-pre-wrap" style={{ fontSize: `${fontSize}px`, lineHeight: "2" }}>
          {chapter.content}
        </div>

        {/* Ad placeholder */}
        <div className="my-8 p-4 rounded-lg border text-center text-sm" style={{ borderColor: isDark ? "#333" : "#e5e5e5", color: isDark ? "#666" : "#999" }}>
          โฆษณา (AdSense)
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between py-6 border-t" style={{ borderColor: isDark ? "#333" : "#e5e5e5" }}>
          {chNum > 1 ? (
            <Button variant="outline" onClick={() => goChapter(chNum - 1)} style={{ borderColor: isDark ? "#444" : undefined, color: textColor }}>
              <ChevronLeft className="w-4 h-4 mr-1" /> ตอนก่อนหน้า
            </Button>
          ) : <div />}

          <span className="text-sm" style={{ color: isDark ? "#888" : "#999" }}>
            {chNum} / {chapter.totalChapters}
          </span>

          {chNum < chapter.totalChapters ? (
            <Button onClick={() => goChapter(chNum + 1)} className="bg-primary hover:bg-primary/90 text-white">
              ตอนถัดไป <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <span className="text-sm font-semibold text-amber-500">จบ</span>
          )}
        </div>
      </div>
    </div>
  );
}
