/*
  NiYAIFREE NovelDetail — Koparion Style + Coral Red + eBook Download
*/
import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Eye, Heart, Clock, Bookmark, ChevronRight, ArrowLeft, Download, FileText, Coins, Crown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSEO, SITE_URL } from "@/hooks/useSEO";

export default function NovelDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, refreshUser } = useAuth();
  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(false);
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [ebookInfo, setEbookInfo] = useState<any>(null);
  const [ebookLoading, setEbookLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      api.getNovel(slug).then(setNovel).catch(() => toast.error("ไม่พบนิยาย")).finally(() => setLoading(false));
    }
  }, [slug]);

  // SEO: Dynamic title/meta based on novel data
  useSEO(novel ? {
    title: `${novel.title} — อ่านฟรี`,
    description: novel.description
      ? `${novel.title} — ${novel.description.substring(0, 150)}... อ่านฟรีที่ NiYAIFREE ${novel.totalChapters} ตอน หมวด${novel.category}`
      : `อ่านนิยาย ${novel.title} ฟรี ${novel.totalChapters} ตอน หมวด${novel.category} โดย ${novel.author} | NiYAIFREE`,
    ogTitle: `${novel.title} — อ่านฟรีที่ NiYAIFREE`,
    ogDescription: novel.description?.substring(0, 200) || `นิยาย ${novel.title} ${novel.totalChapters} ตอน หมวด${novel.category}`,
    ogImage: novel.coverUrl || undefined,
    ogUrl: `${SITE_URL}/novel/${slug}`,
    ogType: "book",
    canonical: `${SITE_URL}/novel/${slug}`,
    keywords: `${novel.title}, ${novel.category}, นิยาย${novel.category}, อ่านนิยายฟรี, ${novel.author}, niyaifree`,
  } : {});

  const handleBookmark = async () => {
    if (!user) { toast.error("กรุณาเข้าสู่ระบบก่อน"); return; }
    const toastId = toast.loading("กำลังบันทึกที่คั่น...");
    try {
      await api.addBookmark({ novelId: novel.id, chapterNumber: 1 });
      toast.success("เพิ่มที่คั่นแล้ว", { id: toastId });
    } catch (e: any) { toast.error(e.message || "ไม่สามารถบันทึกได้", { id: toastId }); }
  };

  const handleOpenEbookModal = async () => {
    if (!user) { toast.error("กรุณาเข้าสู่ระบบก่อน"); return; }
    setShowEbookModal(true);
    setEbookLoading(true);
    try {
      const info = await api.checkEbook(novel.id);
      setEbookInfo(info);
    } catch (e: any) {
      toast.error("ไม่สามารถตรวจสอบสิทธิ์ได้");
      setShowEbookModal(false);
    } finally { setEbookLoading(false); }
  };

  const handlePurchaseEbook = async (method: "vip" | "coins") => {
    setEbookLoading(true);
    const toastId = toast.loading("กำลังซื้อ eBook...");
    try {
      const result = await api.downloadEbook({ novelId: novel.id });
      toast.success(
        result.method === "vip"
          ? `ใช้สิทธิ์ VIP สำเร็จ (${result.downloadsUsed}/${result.downloadsLimit} เล่ม)`
          : `หัก ${result.coinsUsed} Coins สำเร็จ`,
        { id: toastId }
      );
      refreshUser();
      // Refresh ebook info
      const info = await api.checkEbook(novel.id);
      setEbookInfo(info);
    } catch (e: any) {
      toast.error(e.message || "ซื้อไม่สำเร็จ", { id: toastId });
    } finally { setEbookLoading(false); }
  };

  const handleDownloadPdf = async () => {
    setPdfGenerating(true);
    const toastId = toast.loading("กำลังสร้างไฟล์ PDF... อาจใช้เวลาสักครู่");
    try {
      const blob = await api.generateEbookPdf(novel.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${novel.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("ดาวน์โหลด PDF สำเร็จ!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "สร้าง PDF ไม่สำเร็จ", { id: toastId });
    } finally { setPdfGenerating(false); }
  };

  if (loading) return (
    <div className="container py-20 flex justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!novel) return (
    <div className="container py-20 text-center">
      <p className="text-xl text-slate-500">ไม่พบนิยาย</p>
      <Link href="/"><Button className="mt-4 bg-primary text-white">กลับหน้าแรก</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="py-4 border-b border-slate-100 bg-slate-50">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary no-underline">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าแรก
          </Link>
        </div>
      </div>

      {/* Novel Info */}
      <section className="py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={() => novel.coverUrl && setLightbox(true)}>
                {novel.coverUrl ? (
                  <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
                    <span className="text-white text-center text-lg font-semibold font-[Kanit]">{novel.title}</span>
                  </div>
                )}
                {novel.status === "writing" && (
                  <div className="absolute top-3 left-0 bg-amber-500 px-3 py-1 text-xs font-bold text-white rounded-r-lg">
                    กำลังเขียน
                  </div>
                )}
                {novel.status === "completed" && (
                  <div className="absolute top-3 left-0 bg-emerald-500 px-3 py-1 text-xs font-bold text-white rounded-r-lg">
                    จบแล้ว
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
                {novel.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-[Kanit] text-slate-900 mt-1 mb-2">
                {novel.title}
              </h1>
              <p className="text-slate-500 mb-4">โดย {novel.author}</p>

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-500">
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {novel.totalChapters} ตอน</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {novel.viewCount?.toLocaleString()} อ่าน</span>
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {novel.likeCount?.toLocaleString()} ชอบ</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {novel.totalWords?.toLocaleString()} ตัวอักษร</span>
                {novel.ageRating && novel.ageRating !== "ทั่วไป" && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">{novel.ageRating}</span>
                )}
              </div>

              {novel.description && (
                <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-sm font-semibold font-[Kanit] text-slate-900 mb-2">เรื่องย่อ</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{novel.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {novel.chapters?.length > 0 && (
                  <Link href={`/read/${novel.id}/1`}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold">
                      <BookOpen className="w-4 h-4 mr-2" /> เริ่มอ่าน
                    </Button>
                  </Link>
                )}
                <Button size="lg" variant="outline" onClick={handleBookmark} className="border-slate-200 hover:border-primary hover:text-primary">
                  <Bookmark className="w-4 h-4 mr-2" /> บุ๊คมาร์ค
                </Button>
                {/* eBook Download Button */}
                <Button
                  size="lg"
                  onClick={handleOpenEbookModal}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md"
                >
                  <Download className="w-4 h-4 mr-2" /> ดาวน์โหลด eBook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters List */}
      <section className="py-10 border-t border-slate-100 bg-slate-50">
        <div className="container">
          <h2 className="text-xl font-bold font-[Kanit] text-slate-900 mb-6">
            สารบัญ ({novel.chapters?.length || 0} ตอน)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {novel.chapters?.map((ch: any) => (
              <Link key={ch.id} href={`/read/${novel.id}/${ch.chapterNumber}`} className="no-underline">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:shadow-md hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {ch.chapterNumber}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{ch.title || `ตอนที่ ${ch.chapterNumber}`}</p>
                      <p className="text-xs text-slate-400">{ch.wordCount?.toLocaleString()} ตัวอักษร</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          {(!novel.chapters || novel.chapters.length === 0) && (
            <div className="text-center py-12 text-slate-400">
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

      {/* eBook Download Modal */}
      {showEbookModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => !ebookLoading && !pdfGenerating && setShowEbookModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white relative">
              <button onClick={() => !pdfGenerating && setShowEbookModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-[Kanit]">ดาวน์โหลด eBook</h3>
                  <p className="text-sm text-white/80 truncate max-w-[250px]">{novel.title}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {ebookLoading ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
                  <p className="text-slate-500 text-sm">กำลังตรวจสอบสิทธิ์...</p>
                </div>
              ) : ebookInfo ? (
                <div className="space-y-4">
                  {/* Info */}
                  <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">จำนวนตอน</span>
                      <span className="font-semibold text-slate-900">{ebookInfo.chapterCount} ตอน</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">รูปแบบ</span>
                      <span className="font-semibold text-slate-900">PDF (A4)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ฟอนต์</span>
                      <span className="font-semibold text-slate-900">Sarabun + Kanit</span>
                    </div>
                  </div>

                  {ebookInfo.alreadyPurchased ? (
                    /* Already purchased — show download button */
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                        <p className="text-emerald-700 font-semibold text-sm">คุณซื้อ eBook เล่มนี้แล้ว</p>
                        <p className="text-emerald-600 text-xs mt-1">สามารถดาวน์โหลดได้ภายใน 30 วัน</p>
                      </div>
                      <Button
                        onClick={handleDownloadPdf}
                        disabled={pdfGenerating}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold h-12 text-base"
                      >
                        {pdfGenerating ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังสร้าง PDF...</>
                        ) : (
                          <><Download className="w-5 h-5 mr-2" /> ดาวน์โหลด PDF</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    /* Not purchased — show purchase options */
                    <div className="space-y-3">
                      {/* VIP Option */}
                      {ebookInfo.isVip && (
                        <button
                          onClick={() => handlePurchaseEbook("vip")}
                          disabled={ebookLoading || ebookInfo.vipDownloadsUsed >= ebookInfo.vipDownloadsLimit}
                          className="w-full p-4 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-amber-800 font-[Kanit]">ใช้สิทธิ์ VIP (ฟรี)</p>
                              <p className="text-xs text-amber-600 mt-0.5">
                                ใช้ไปแล้ว {ebookInfo.vipDownloadsUsed}/{ebookInfo.vipDownloadsLimit} เล่มเดือนนี้
                              </p>
                            </div>
                            {ebookInfo.vipDownloadsUsed < ebookInfo.vipDownloadsLimit ? (
                              <span className="text-amber-700 font-bold">ฟรี</span>
                            ) : (
                              <span className="text-red-500 text-xs font-semibold">ครบโควต้า</span>
                            )}
                          </div>
                        </button>
                      )}

                      {/* Coins Option */}
                      <button
                        onClick={() => handlePurchaseEbook("coins")}
                        disabled={ebookLoading || ebookInfo.coins < ebookInfo.coinCost}
                        className="w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Coins className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-blue-800 font-[Kanit]">ใช้ Coins</p>
                            <p className="text-xs text-blue-600 mt-0.5">
                              คงเหลือ {ebookInfo.coins} Coins
                            </p>
                          </div>
                          <span className="text-blue-700 font-bold">{ebookInfo.coinCost} Coins</span>
                        </div>
                      </button>

                      {ebookInfo.coins < ebookInfo.coinCost && !ebookInfo.isVip && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                          <p className="text-red-600 text-sm">Coins ไม่เพียงพอ</p>
                          <Link href="/coins" className="text-primary text-sm font-semibold underline">ซื้อ Coins เพิ่ม</Link>
                          <span className="mx-2 text-slate-300">|</span>
                          <Link href="/vip" className="text-amber-600 text-sm font-semibold underline">สมัคร VIP</Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copyright Warning */}
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-3">
                    <p className="text-xs text-red-600 leading-relaxed">
                      <strong>คำเตือนลิขสิทธิ์:</strong> ห้ามคัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ หรือจำหน่ายเนื้อหาในไฟล์นี้
                      โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร ตาม พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
