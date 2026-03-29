/*
  NiYAIFREE eBook Library — Download History
*/
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Download, FileText, ArrowLeft, BookOpen, Crown, Coins, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatThaiDateMedium } from "@/lib/thaiDate";
import { useSEO } from "@/hooks/useSEO";

export default function EbookLibrary() {
  useSEO({ title: "eBook ของฉัน", noindex: true });

  const { user } = useAuth();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    api.getDownloadHistory()
      .then(setDownloads)
      .catch(() => toast.error("โหลดประวัติไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleRedownload = async (novelId: number, title: string) => {
    setGeneratingId(novelId);
    const toastId = toast.loading(`กำลังสร้าง PDF "${title}"...`);
    try {
      const blob = await api.generateEbookPdf(novelId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("ดาวน์โหลดสำเร็จ!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "ดาวน์โหลดล้มเหลว", { id: toastId });
    } finally { setGeneratingId(null); }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-xl text-slate-500 mb-4">กรุณาเข้าสู่ระบบเพื่อดู eBook ของคุณ</p>
        <Link href="/login"><Button className="bg-primary text-white">เข้าสู่ระบบ</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-10">
        <div className="container">
          <Link href="/member" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white no-underline mb-4">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าสมาชิก
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-[Kanit] text-white">คลัง eBook ของฉัน</h1>
              <p className="text-white/80 text-sm mt-1">{downloads.length} เล่มที่ดาวน์โหลดแล้ว</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="container -mt-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">สถานะ VIP</p>
              <p className="font-bold text-slate-900 font-[Kanit]">
                {user.vipUntil && new Date(user.vipUntil) > new Date() ? "VIP Member" : "ไม่มี VIP"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Coins คงเหลือ</p>
              <p className="font-bold text-slate-900 font-[Kanit]">{user.coins || 0} Coins</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">ดาวน์โหลดทั้งหมด</p>
              <p className="font-bold text-slate-900 font-[Kanit]">{downloads.length} เล่ม</p>
            </div>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      <div className="container pb-16">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p className="text-lg text-slate-400 mb-2">ยังไม่มี eBook ที่ดาวน์โหลด</p>
            <p className="text-sm text-slate-400 mb-6">เลือกนิยายที่ชอบแล้วกดดาวน์โหลด eBook ได้เลย</p>
            <Link href="/"><Button className="bg-primary text-white">เลือกนิยาย</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {downloads.map((dl: any) => {
              const isExpired = new Date(dl.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000 < Date.now();
              return (
                <div key={dl.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4">
                  <div className="flex items-center gap-4">
                    {/* Cover */}
                    <Link href={`/novel/${dl.novelId}`} className="flex-shrink-0">
                      <div className="w-16 h-22 rounded-lg overflow-hidden bg-slate-100">
                        {dl.coverUrl ? (
                          <img src={dl.coverUrl} alt={dl.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white/50" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/novel/${dl.novelId}`} className="no-underline">
                        <h3 className="font-bold text-slate-900 font-[Kanit] truncate hover:text-primary transition-colors">
                          {dl.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatThaiDateMedium(dl.createdAt)}
                        </span>
                        {dl.coinCost > 0 ? (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Coins className="w-3 h-3" /> {dl.coinCost} Coins
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Crown className="w-3 h-3" /> VIP ฟรี
                          </span>
                        )}
                        <span className="uppercase text-slate-400">PDF</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="flex-shrink-0">
                      {isExpired ? (
                        <span className="text-xs text-red-500 font-semibold">หมดอายุ</span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRedownload(dl.novelId, dl.title)}
                          disabled={generatingId === dl.novelId}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                          {generatingId === dl.novelId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Download className="w-4 h-4 mr-1" /> โหลด</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
