/*
  Member Dashboard — /member
  Profile overview, reading history, bookmarks, VIP status, coins
*/
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import {
  User, BookOpen, Bookmark, Crown, Coins, Clock, Heart,
  Settings, ChevronRight, Star, Download, Shield
} from "lucide-react";

export default function MemberDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [history, setHistory] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [histRes, bookRes] = await Promise.all([
        api.getReadingHistory().catch(() => []),
        api.getBookmarks().catch(() => []),
      ]);
      setHistory(histRes || []);
      setBookmarks(bookRes || []);
    } catch {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const isVip = user.vipUntil && new Date(user.vipUntil) > new Date();

  const tabs = [
    { key: "overview", label: "ภาพรวม", icon: User },
    { key: "history", label: "ประวัติการอ่าน", icon: Clock },
    { key: "bookmarks", label: "ที่คั่นหนังสือ", icon: Bookmark },
    { key: "vip", label: "VIP", icon: Crown },
    { key: "coins", label: "Coins", icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-[Kanit]">{user.firstName || user.username}</h1>
              <p className="text-white/80 text-sm">{user.memberId} · {user.email}</p>
              <div className="flex items-center gap-3 mt-1">
                {isVip && <span className="vip-badge"><Crown className="w-3 h-3" /> VIP</span>}
                <span className="text-xs text-white/70">{user.points} แต้ม · {user.coins || 0} Coins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="container flex gap-1 overflow-x-auto py-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-8">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-center">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{history.length}</p>
                <p className="text-xs text-slate-500">อ่านแล้ว</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-center">
                <Bookmark className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{bookmarks.length}</p>
                <p className="text-xs text-slate-500">ที่คั่น</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-center">
                <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{user.points}</p>
                <p className="text-xs text-slate-500">แต้ม</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-center">
                <Coins className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{user.coins || 0}</p>
                <p className="text-xs text-slate-500">Coins</p>
              </div>
            </div>

            {/* eBook Library Quick Link */}
            <Link href="/member/ebooks" className="no-underline">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold font-[Kanit] text-white text-lg">คลัง eBook ของฉัน</h3>
                      <p className="text-white/80 text-sm">ดาวน์โหลด eBook เป็น PDF ได้ที่นี่</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/60" />
                </div>
              </div>
            </Link>

            {/* Recent History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold font-[Kanit]">อ่านล่าสุด</h3>
                <button onClick={() => setActiveTab("history")} className="text-sm text-primary font-medium">ดูทั้งหมด</button>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>ยังไม่มีประวัติการอ่าน</p>
                  <Link href="/search" className="text-primary text-sm mt-2 inline-block">เริ่มอ่านนิยาย →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 5).map((item: any, i: number) => (
                    <Link key={i} href={`/novel/${item.novelSlug || item.novelId}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-primary/5 transition-colors no-underline">
                      <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden shrink-0">
                        {item.coverUrl && <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.novelTitle || "นิยาย"}</p>
                        <p className="text-xs text-slate-500">ตอนที่ {item.chapterNumber} · {item.readAt ? new Date(item.readAt).toLocaleDateString("th-TH") : ""}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold font-[Kanit] text-lg mb-4">ประวัติการอ่าน</h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-lg">ยังไม่มีประวัติการอ่าน</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item: any, i: number) => (
                  <Link key={i} href={`/novel/${item.novelSlug || item.novelId}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-primary/5 transition-colors no-underline">
                    <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden shrink-0">
                      {item.coverUrl && <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.novelTitle || "นิยาย"}</p>
                      <p className="text-xs text-slate-500">ตอนที่ {item.chapterNumber}</p>
                    </div>
                    <p className="text-xs text-slate-400">{item.readAt ? new Date(item.readAt).toLocaleDateString("th-TH") : ""}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks */}
        {activeTab === "bookmarks" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold font-[Kanit] text-lg mb-4">ที่คั่นหนังสือ</h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bookmark className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-lg">ยังไม่มีที่คั่น</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookmarks.map((item: any, i: number) => (
                  <Link key={i} href={`/novel/${item.novelSlug || item.novelId}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-primary/5 transition-colors no-underline">
                    <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden shrink-0">
                      {item.coverUrl && <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.novelTitle || "นิยาย"}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIP */}
        {activeTab === "vip" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-amber-600" />
                <div>
                  <h3 className="font-bold font-[Kanit] text-lg text-amber-900">สถานะ VIP</h3>
                  <p className="text-sm text-amber-700">
                    {isVip ? `VIP ถึง ${new Date(user.vipUntil!).toLocaleDateString("th-TH")}` : "ยังไม่ได้สมัคร VIP"}
                  </p>
                </div>
              </div>
              {!isVip && (
                <Link href="/vip" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all no-underline">
                  สมัคร VIP ฿100/เดือน <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold font-[Kanit] mb-4">สิทธิพิเศษ VIP</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs font-bold">✓</div>
                  อ่านนิยายยาวเกิน 30 ตอนได้ทุกเรื่อง
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs font-bold">✓</div>
                  โหลด eBook เป็นรูปเล่มได้ 10 เล่ม/เดือน
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs font-bold">✓</div>
                  ไม่มีโฆษณา อ่านสบายตา
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Coins */}
        {activeTab === "coins" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="w-8 h-8 text-emerald-600" />
                <div>
                  <h3 className="font-bold font-[Kanit] text-lg text-emerald-900">Coins ของคุณ</h3>
                  <p className="text-3xl font-bold text-emerald-700">{user.coins || 0} Coins</p>
                </div>
              </div>
              <Link href="/coins" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all no-underline">
                ซื้อ Coins <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold font-[Kanit] mb-4">Coins ใช้ทำอะไรได้?</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <Download className="w-5 h-5 text-emerald-500" />
                  โหลด eBook — 10 Coins ต่อ 1 เล่ม
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
