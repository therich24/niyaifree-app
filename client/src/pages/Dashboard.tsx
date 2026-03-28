/*
  Legacy Dashboard — /dashboard, /bookmarks
  Redirects to /member for unified experience
  Coral Red Theme
*/
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { BookOpen, Bookmark, Clock, Gift, Share2, Eye, ChevronRight, User, Crown, Coins } from "lucide-react";
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

  const isVip = user.vipUntil && new Date(user.vipUntil) > new Date();
  const isFreeActive = user.freeReadUntil && new Date(user.freeReadUntil) > new Date();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">
              {user.firstName?.[0] || user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold font-[Kanit]">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-slate-500">{user.memberId} · {user.email}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-semibold bg-amber-50 text-amber-700">
                  <Gift className="w-3 h-3" /> {user.points} แต้ม
                </span>
                {isVip && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-semibold bg-primary/10 text-primary">
                    <Crown className="w-3 h-3" /> VIP
                  </span>
                )}
                {isFreeActive && (
                  <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                    อ่านฟรีถึง {new Date(user.freeReadUntil!).toLocaleDateString("th-TH")}
                  </span>
                )}
                <span className="text-sm text-slate-500">รหัสแนะนำ: <strong>{user.referralCode}</strong></span>
              </div>
            </div>
            <div className="flex gap-2">
              {(user.role === "admin" || user.role === "ceo") && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">จัดการระบบ</Button>
                </Link>
              )}
              <Link href="/member">
                <Button variant="outline" size="sm">แดชบอร์ดใหม่</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Earn Points */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="font-bold font-[Kanit] mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" /> รับแต้มเพิ่ม
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button onClick={() => earnPoints("daily")} className="p-4 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors text-left">
              <p className="font-semibold text-sm text-slate-900">เช็คอินรายวัน</p>
              <p className="text-xs text-slate-500 mt-1">+10 แต้ม/วัน</p>
            </button>
            <button onClick={() => earnPoints("share")} className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors text-left">
              <p className="font-semibold text-sm text-slate-900">แชร์นิยาย</p>
              <p className="text-xs text-slate-500 mt-1">+5 แต้ม/ครั้ง</p>
            </button>
            <button onClick={() => earnPoints("read")} className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors text-left">
              <p className="font-semibold text-sm text-slate-900">อ่านนิยาย</p>
              <p className="text-xs text-slate-500 mt-1">+2 แต้ม/ตอน</p>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              tab === "history" ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Clock className="w-4 h-4" /> ประวัติการอ่าน ({history.length})
          </button>
          <button
            onClick={() => setTab("bookmarks")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              tab === "bookmarks" ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Bookmark className="w-4 h-4" /> ที่คั่น ({bookmarks.length})
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {tab === "history" && (
            <>
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg">ยังไม่มีประวัติการอ่าน</p>
                  <Link href="/search" className="text-primary text-sm mt-2 inline-block">เริ่มอ่านนิยาย →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item: any, i: number) => (
                    <Link key={i} href={`/novel/${item.slug || item.novelId}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-primary/5 transition-colors no-underline">
                      <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden shrink-0">
                        {item.coverUrl && <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.title || "นิยาย"}</p>
                        <p className="text-xs text-slate-500">ตอนที่ {item.chapterNumber}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === "bookmarks" && (
            <>
              {bookmarks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bookmark className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg">ยังไม่มีที่คั่น</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((item: any, i: number) => (
                    <Link key={i} href={`/novel/${item.slug || item.novelId}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-primary/5 transition-colors no-underline">
                      <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden shrink-0">
                        {item.coverUrl && <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.title || "นิยาย"}</p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
