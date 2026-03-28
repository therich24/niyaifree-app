/**
 * Design: Koparion Reborn — Novel detail page with cover, chapters list, bookmark
 * Cover: Click to expand (lightbox)
 * Missing cover: Black placeholder with title
 */
import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Eye, Heart, Clock, Bookmark, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NovelDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      api.getNovel(slug).then(setNovel).catch(() => toast.error("ไม่พบนิยาย")).finally(() => setLoading(false));
    }
  }, [slug]);

  const handleBookmark = async () => {
    if (!user) { toast.error("กรุณาเข้าสู่ระบบก่อน"); return; }
    try {
      await api.addBookmark({ novelId: novel.id, chapterNumber: 1 });
      toast.success("เพิ่มที่คั่นแล้ว");
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return (
    <div className="container py-20 flex justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!novel) return (
    <div className="container py-20 text-center">
      <p className="text-xl text-muted-foreground">ไม่พบนิยาย</p>
      <Link href="/"><Button className="mt-4">กลับหน้าแรก</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-4 border-b" style={{ background: "oklch(0.97 0.005 155)" }}>
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground no-underline">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าแรก
          </Link>
        </div>
      </div>

      {/* Novel Info */}
      <section className="py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={() => novel.coverUrl && setLightbox(true)}>
                {novel.coverUrl ? (
                  <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center p-4">
                    <span className="text-white text-center text-lg font-semibold" style={{ fontFamily: "Kanit" }}>{novel.title}</span>
                  </div>
                )}
                {novel.status === "writing" && (
                  <div className="absolute top-3 left-0 px-3 py-1 text-xs font-bold text-white rounded-r-lg" style={{ background: "oklch(0.72 0.16 60)" }}>
                    กำลังเขียน
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <span className="genre-pill mb-3">{novel.category}</span>
              <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-2" style={{ fontFamily: "Kanit", color: "oklch(0.25 0.06 155)" }}>
                {novel.title}
              </h1>
              <p className="text-muted-foreground mb-4">โดย {novel.author}</p>

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {novel.totalChapters} ตอน</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {novel.viewCount?.toLocaleString()} อ่าน</span>
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {novel.likeCount?.toLocaleString()} ชอบ</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {novel.totalWords?.toLocaleString()} คำ</span>
                {novel.ageRating && novel.ageRating !== "ทั่วไป" && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">{novel.ageRating}</span>
                )}
              </div>

              {novel.description && (
                <div className="mb-6 p-4 rounded-lg bg-muted/50 border">
                  <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "Kanit" }}>เรื่องย่อ</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{novel.description}</p>
                </div>
              )}

              <div className="flex gap-3">
                {novel.chapters?.length > 0 && (
                  <Link href={`/read/${novel.id}/1`}>
                    <Button size="lg" className="text-white font-semibold" style={{ background: "oklch(0.40 0.12 155)" }}>
                      <BookOpen className="w-4 h-4 mr-2" /> เริ่มอ่าน
                    </Button>
                  </Link>
                )}
                <Button size="lg" variant="outline" onClick={handleBookmark}>
                  <Bookmark className="w-4 h-4 mr-2" /> บุ๊คมาร์ค
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters List */}
      <section className="py-8 border-t" style={{ background: "oklch(0.97 0.005 155)" }}>
        <div className="container">
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "Kanit", color: "oklch(0.25 0.06 155)" }}>
            สารบัญ ({novel.chapters?.length || 0} ตอน)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {novel.chapters?.map((ch: any) => (
              <Link key={ch.id} href={`/read/${novel.id}/${ch.chapterNumber}`} className="no-underline">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border hover:shadow-md hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "oklch(0.40 0.12 155)" }}>
                      {ch.chapterNumber}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{ch.title || `ตอนที่ ${ch.chapterNumber}`}</p>
                      <p className="text-xs text-muted-foreground">{ch.wordCount?.toLocaleString()} คำ</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          {(!novel.chapters || novel.chapters.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>ยังไม่มีตอนในนิยายเรื่องนี้</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && novel.coverUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <img src={novel.coverUrl} alt={novel.title} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
