/*
  CEO Dashboard — /ceo
  Separate login, full overview, revenue, analytics
*/
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Crown, BookOpen, Users, TrendingUp, DollarSign, Eye, BarChart3,
  LogOut, Settings, Shield, Activity, Coins, Download, Star
} from "lucide-react";

export default function CeoDashboard() {
  const [authed, setAuthed] = useState(false);
  const [ceoUser, setCeoUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("niyaifree_ceo_token");
    const user = localStorage.getItem("niyaifree_ceo_user");
    if (token && user) {
      setAuthed(true);
      setCeoUser(JSON.parse(user));
      loadStats(token);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.user.role !== "ceo") {
        toast.error("เฉพาะ CEO เท่านั้นที่เข้าได้");
        return;
      }
      localStorage.setItem("niyaifree_ceo_token", data.token);
      localStorage.setItem("niyaifree_ceo_user", JSON.stringify(data.user));
      setAuthed(true);
      setCeoUser(data.user);
      loadStats(data.token);
      toast.success("เข้าสู่ระบบ CEO สำเร็จ");
    } catch (err: any) {
      toast.error(err.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadStats(token: string) {
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStats(await res.json());
    } catch {}
  }

  function handleLogout() {
    localStorage.removeItem("niyaifree_ceo_token");
    localStorage.removeItem("niyaifree_ceo_user");
    setAuthed(false);
    setCeoUser(null);
    toast.success("ออกจากระบบ CEO แล้ว");
  }

  // CEO Login Page
  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/30">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white font-[Kanit]">CEO Dashboard</h1>
            <p className="text-slate-400 mt-2">NiYAIFREE — iDea Memory Group</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  placeholder="CEO Username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  placeholder="Password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50"
              >
                {loginLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ CEO"}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-500 text-xs mt-6">
            <Shield className="w-3 h-3 inline mr-1" />
            ระบบนี้สำหรับ CEO เท่านั้น การเข้าถึงโดยไม่ได้รับอนุญาตถือเป็นการกระทำที่ผิดกฎหมาย
          </p>
        </div>
      </div>
    );
  }

  // CEO Dashboard
  const statCards = [
    { label: "นิยายทั้งหมด", value: stats?.totalNovels || 0, icon: BookOpen, color: "bg-blue-500" },
    { label: "สมาชิกทั้งหมด", value: stats?.totalUsers || 0, icon: Users, color: "bg-emerald-500" },
    { label: "ยอดอ่านรวม", value: stats?.totalViews || 0, icon: Eye, color: "bg-purple-500" },
    { label: "สมาชิก VIP", value: stats?.vipUsers || 0, icon: Crown, color: "bg-amber-500" },
    { label: "รายได้เดือนนี้", value: `฿${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "bg-green-500" },
    { label: "Coins ขายแล้ว", value: stats?.totalCoinsSold || 0, icon: Coins, color: "bg-orange-500" },
  ];

  const tabs = [
    { key: "overview", label: "ภาพรวม", icon: BarChart3 },
    { key: "revenue", label: "รายได้", icon: DollarSign },
    { key: "users", label: "สมาชิก", icon: Users },
    { key: "content", label: "เนื้อหา", icon: BookOpen },
    { key: "settings", label: "ตั้งค่า", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* CEO Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-[Kanit]">CEO Dashboard</h1>
              <p className="text-xs text-slate-400">NiYAIFREE — {ceoUser?.firstName || ceoUser?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">ไปหน้าเว็บ</a>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm">
              <LogOut className="w-4 h-4" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container flex gap-1 overflow-x-auto py-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold font-[Kanit] mb-4">การดำเนินการด่วน</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "สร้างนิยาย AI", icon: Star, href: "/admin" },
                  { label: "จัดการสมาชิก", icon: Users, href: "/admin" },
                  { label: "ดูรายงาน", icon: BarChart3, href: "#" },
                  { label: "ตั้งค่าระบบ", icon: Settings, href: "/admin" },
                ].map((action, i) => (
                  <a
                    key={i}
                    href={action.href}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-primary/5 hover:border-primary border border-transparent transition-all no-underline text-slate-700"
                  >
                    <action.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold font-[Kanit] mb-4">กิจกรรมล่าสุด</h3>
              <div className="space-y-3">
                {[
                  { text: "ระบบสร้างนิยายอัตโนมัติ 5 เรื่อง", time: "2 นาทีที่แล้ว", icon: BookOpen },
                  { text: "สมาชิกใหม่ 12 คน วันนี้", time: "15 นาทีที่แล้ว", icon: Users },
                  { text: "ยอดขาย VIP +3 รายการ", time: "1 ชั่วโมงที่แล้ว", icon: Crown },
                  { text: "Coins ขาย 500 coins", time: "2 ชั่วโมงที่แล้ว", icon: Coins },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{item.text}</p>
                      <p className="text-xs text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "revenue" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold font-[Kanit] mb-4">รายงานรายได้</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium">รายได้วันนี้</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">฿{(stats?.dailyRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">รายได้เดือนนี้</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">฿{(stats?.monthlyRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-sm text-purple-600 font-medium">รายได้ทั้งหมด</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">฿{(stats?.totalRevenue || 0).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">ข้อมูลรายได้จะอัปเดตอัตโนมัติเมื่อมีการชำระเงินผ่านระบบ</p>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold font-[Kanit] mb-4">ภาพรวมสมาชิก</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-slate-500">สมาชิกทั้งหมด</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-amber-700">{stats?.vipUsers || 0}</p>
                <p className="text-sm text-amber-600">VIP</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-emerald-700">{stats?.newUsersToday || 0}</p>
                <p className="text-sm text-emerald-600">สมัครวันนี้</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-700">{stats?.activeUsers || 0}</p>
                <p className="text-sm text-blue-600">ใช้งานวันนี้</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold font-[Kanit] mb-4">ภาพรวมเนื้อหา</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-slate-900">{stats?.totalNovels || 0}</p>
                <p className="text-sm text-slate-500">นิยายทั้งหมด</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-700">{stats?.totalChapters || 0}</p>
                <p className="text-sm text-blue-600">ตอนทั้งหมด</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-purple-700">{stats?.totalViews || 0}</p>
                <p className="text-sm text-purple-600">ยอดอ่านรวม</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-emerald-700">{stats?.publishedNovels || 0}</p>
                <p className="text-sm text-emerald-600">เผยแพร่แล้ว</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold font-[Kanit] mb-4">ตั้งค่าระบบ</h3>
            <p className="text-slate-500">ไปที่ <a href="/admin" className="text-primary font-semibold">Admin Panel</a> เพื่อจัดการตั้งค่าทั้งหมด</p>
          </div>
        )}
      </div>
    </div>
  );
}
