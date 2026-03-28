/**
 * Design: Koparion Reborn — Clean reader with progress bar, bg color picker, auto-next
 * Mobile-first, reading progress bar at top
 */
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, ArrowLeft, BookOpen, Settings2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bgColor, setBgColor] = useState(localStorage.getItem("reader_bg") || "#FFF8E7");
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("reader_fs") || "18"));
  const [showSettings, setShowSettings] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  const isDark = bgColor === "#1A1A1A";
  const textColor = isDark ? "#E0E0E0" : "#2D2D2D";

  useEffect(() => {
    if (novelId && chapterNumber) {
      setLoading(true);
      startTime.current = Date.now();
      api.getChapter(parseInt(novelId), parseInt(chapterNumber))
        .then(setChapter)
        .catch(() => toast.error("ไม่พบตอนนี้"))
        .finally(() => setLoading(false));
    }
  }, [novelId, chapterNumber]);

  // Scroll progress
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

  // Log reading when leaving
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
        <p className="text-xl text-muted-foreground mb-4">ไม่พบตอนนี้</p>
        <Link href="/"><Button>กลับหน้าแรก</Button></Link>
      </div>
    </div>
  );

  const chNum = parseInt(chapterNumber!);

  return (
    <div className="min-h-screen" style={{ background: bgColor, color: textColor }}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1">
        <div className="reading-progress h-full transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Top nav */}
      <div className="sticky top-1 z-40 backdrop-blur-md border-b" style={{ background: isDark ? "rgba(26,26,26,0.95)" : "rgba(255,255,255,0.95)", borderColor: isDark ? "#333" : "#e5e5e5" }}>
        <div className="container flex items-center justify-between h-12">
          <Link href={`/novel/${chapter.novelId}`} className="flex items-center gap-1 text-sm no-underline" style={{ color: "oklch(0.40 0.12 155)" }}>
            <ArrowLeft className="w-4 h-4" /> กลับ
          </Link>
          <span className="text-sm font-medium truncate max-w-[200px]" style={{ fontFamily: "Kanit" }}>
            ตอนที่ {chNum}
          </span>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-md hover:bg-black/5">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Settings panel */}
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
                <input type="range" min="14" max="28" value={fontSize} onChange={e => saveFs(parseInt(e.target.value))} className="flex-1" />
                <button onClick={() => saveFs(Math.min(28, fontSize + 2))} className="w-8 h-8 rounded border flex items-center justify-center text-sm font-bold">A+</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} className="container max-w-3xl py-8">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-center" style={{ fontFamily: "Kanit" }}>
          {chapter.title || `ตอนที่ ${chNum}`}
        </h1>

        <div
          className="leading-loose whitespace-pre-wrap"
          style={{ fontSize: `${fontSize}px`, lineHeight: "2" }}
        >
          {chapter.content}
        </div>

        {/* Ad placeholder */}
        <div className="my-8 p-4 rounded-lg border text-center text-sm text-muted-foreground" style={{ borderColor: isDark ? "#333" : "#e5e5e5" }}>
          โฆษณา (AdSense)
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between py-6 border-t" style={{ borderColor: isDark ? "#333" : "#e5e5e5" }}>
          {chNum > 1 ? (
            <Button variant="outline" onClick={() => goChapter(chNum - 1)} style={{ borderColor: isDark ? "#444" : undefined, color: textColor }}>
              <ChevronLeft className="w-4 h-4 mr-1" /> ตอนก่อนหน้า
            </Button>
          ) : <div />}

          <span className="text-sm text-muted-foreground">
            {chNum} / {chapter.totalChapters}
          </span>

          {chNum < chapter.totalChapters ? (
            <Button onClick={() => goChapter(chNum + 1)} className="text-white" style={{ background: "oklch(0.40 0.12 155)" }}>
              ตอนถัดไป <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <span className="text-sm font-semibold" style={{ color: "oklch(0.72 0.16 60)" }}>จบ</span>
          )}
        </div>
      </div>
    </div>
  );
}
