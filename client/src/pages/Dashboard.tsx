import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { BookOpen, Bookmark, Clock, Gift, Share2, Eye, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const [history, setHistory] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [tab, setTab] = useState<"history" | "bookmarks">("history");

  useEffect(() => {
    if (!user) { setLocation("/login"); return; }
    api.getReadingHistory().then(setHistory).catch(() => toast.error("ไม่สามารถโหลดประวัติการอ่านได้"));
    api.getBookmarks().then(setBookmarks).catch(() => toast.error("ไม่สามารถโหลดที่คั่นได้"));
  }, [user]);

  const earnPoints = async (type: string) => {
    try {
      const res = await api.earnPoints(type);
      toast.success(`ได้รับ ${res.pointsEarned} แต้ม! (รวม ${res.pointsTotal})`);
      refreshUser();
    } catch (e: any) { toast.error(e.message); }
  };

  if (!user) return null;

  const isFreeActive = user.freeReadUntil && new Date(user.freeReadUntil) > new Date();

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.005 155)" }}>
      <div className="container py-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: "oklch(0.40 0.12 155)" }}>
              {user.firstName?.[0] || user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold" style={{ fontFamily: "Kanit" }}>{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-muted-foreground">{user.memberId} · {user.email}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-semibold" style={{ background: "oklch(0.72 0.16 60 / 0.15)", color: "oklch(0.55 0.16 60)" }}>
                  <Gift className="w-3 h-3" /> {user.points} แต้ม
                </span>
                {isFreeActive && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-semibold" style={{ background: "oklch(0.40 0.12 155 / 0.1)", color: "oklch(0.40 0.12 155)" }}>
                    อ่านฟรีถึง {new Date(user.freeReadUntil!).toLocaleDateString("th-TH")}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">รหัสแนะนำ: <strong>{user.referralCode}</strong></span>
              </div>
            </div>
            {(user.role === "admin" || user.role === "ceo") && (
              <Link href="/admin">
                <Button variant="outline" size="sm">จัดการระบบ</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Earn points */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Kanit" }}>รับแต้มเพิ่ม</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button onClick={() => earnPoints("share")} className="p-4 rounded-xl border hover:shadow-md transition-all text-center">
              <Share2 className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.40 0.12 155)" }} />
              <p className="text-sm font-semibold">แชร์</p>
              <p className="text-xs text-muted-foreground">+10 แต้ม</p>
            </button>
            <button onClick={() => earnPoints("watch_ad")} className="p-4 rounded-xl border hover:shadow-md transition-all text-center">
              <Eye className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.72 0.16 60)" }} />
              <p className="text-sm font-semibold">ดูโฆษณา</p>
              <p className="text-xs text-muted-foreground">+10 แต้ม</p>
            </button>
            <button onClick={() => toast.info("Feature coming soon")} className="p-4 rounded-xl border hover:shadow-md transition-all text-center">
              <Gift className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-semibold">มินิเกม</p>
              <p className="text-xs text-muted-foreground">+10-30 แต้ม</p>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("history")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "history" ? "text-white" : "bg-white border text-foreground"}`} style={tab === "history" ? { background: "oklch(0.40 0.12 155)" } : {}}>
            <Clock className="w-4 h-4 inline mr-1" /> อ่านต่อ ({history.length})
          </button>
          <button onClick={() => setTab("bookmarks")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "bookmarks" ? "text-white" : "bg-white border text-foreground"}`} style={tab === "bookmarks" ? { background: "oklch(0.40 0.12 155)" } : {}}>
            <Bookmark className="w-4 h-4 inline mr-1" /> ที่คั่น ({bookmarks.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {(tab === "history" ? history : bookmarks).map((item: any) => (
            <Link key={item.novelId || item.id} href={`/novel/${item.slug}`} className="no-underline">
              <div className="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <span className="text-white text-[8px] text-center px-1">{item.title}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold line-clamp-1" style={{ fontFamily: "Kanit" }}>{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                  <p className="text-xs mt-1" style={{ color: "oklch(0.40 0.12 155)" }}>
                    {tab === "history" ? `อ่านถึงตอนที่ ${item.lastChapter || item.chapterNumber}` : `ที่คั่นตอนที่ ${item.chapterNumber}`}
                    {item.totalChapters && ` / ${item.totalChapters}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
          {(tab === "history" ? history : bookmarks).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{tab === "history" ? "ยังไม่มีประวัติการอ่าน" : "ยังไม่มีที่คั่น"}</p>
              <Link href="/"><Button className="mt-3" variant="outline" size="sm">ไปอ่านนิยาย</Button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
