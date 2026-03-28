/**
 * Design: Koparion Reborn — Admin Panel with sidebar navigation
 * Bright colors per knowledge requirement
 * API connections disabled by default, enabled via button press
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BarChart3, BookOpen, Users, Key, Settings, Wand2, Shield, Plus, Trash2, Edit,
  ChevronRight, Eye, FileText, CheckCircle, XCircle, RefreshCw, Zap, PenTool
} from "lucide-react";

type Tab = "dashboard" | "novels" | "users" | "generate" | "proof" | "apikeys" | "adsense" | "settings";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "ceo")) {
      setLocation("/login");
    }
  }, [user]);

  if (!user || (user.role !== "admin" && user.role !== "ceo")) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "แดชบอร์ด", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "novels", label: "จัดการนิยาย", icon: <BookOpen className="w-4 h-4" /> },
    { id: "users", label: "จัดการสมาชิก", icon: <Users className="w-4 h-4" /> },
    { id: "generate", label: "DOONOVEL (AI สร้าง)", icon: <Wand2 className="w-4 h-4" /> },
    { id: "proof", label: "DOOPROOF (พิสูจน์อักษร)", icon: <PenTool className="w-4 h-4" /> },
    { id: "apikeys", label: "API Keys", icon: <Key className="w-4 h-4" /> },
    { id: "adsense", label: "AdSense", icon: <Zap className="w-4 h-4" /> },
    { id: "settings", label: "ตั้งค่าระบบ", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.97 0.005 155)" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex-shrink-0 hidden lg:block">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold" style={{ fontFamily: "Kanit", color: "oklch(0.40 0.12 155)" }}>
            <Shield className="w-5 h-5 inline mr-2" />
            {user.role === "ceo" ? "CEO Panel" : "Admin Panel"}
          </h2>
        </div>
        <nav className="p-2 space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "text-white shadow-md" : "text-foreground hover:bg-muted"}`}
              style={tab === t.id ? { background: "oklch(0.40 0.12 155)" } : {}}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[70px] flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${tab === t.id ? "text-primary" : "text-muted-foreground"}`}
          >
            {t.icon}
            <span className="truncate max-w-[60px]">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8 overflow-auto">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "novels" && <NovelsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "generate" && <GenerateTab />}
        {tab === "proof" && <ProofTab />}
        {tab === "apikeys" && <ApiKeysTab />}
        {tab === "adsense" && <AdSenseTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

// ===== DASHBOARD =====
function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.getStats().then(setStats).catch(() => toast.error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้")); }, []);

  if (!stats) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Kanit" }}>แดชบอร์ด CEO</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "นิยายทั้งหมด", value: stats.totalNovels, icon: <BookOpen className="w-5 h-5" />, color: "oklch(0.40 0.12 155)" },
          { label: "ตอนทั้งหมด", value: stats.totalChapters, icon: <FileText className="w-5 h-5" />, color: "oklch(0.72 0.16 60)" },
          { label: "สมาชิกทั้งหมด", value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: "#2196F3" },
          { label: "ยอดอ่านรวม", value: stats.totalViews?.toLocaleString(), icon: <Eye className="w-5 h-5" />, color: "#E91E63" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ background: s.color + "15", color: s.color }}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "Kanit" }}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top novels */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Kanit" }}>Top 10 นิยายยอดนิยม</h2>
        <div className="space-y-2">
          {stats.topNovels?.map((n: any, i: number) => (
            <div key={n.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: i < 3 ? "oklch(0.72 0.16 60)" : "oklch(0.70 0.02 50)" }}>
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium truncate">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.viewCount?.toLocaleString()} อ่าน</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category stats */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Kanit" }}>สถิติหมวดหมู่</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stats.categoryStats?.map((c: any) => (
            <div key={c.category} className="p-3 rounded-lg border text-center">
              <p className="text-sm font-semibold">{c.category}</p>
              <p className="text-lg font-bold" style={{ color: "oklch(0.40 0.12 155)" }}>{c.count}</p>
              <p className="text-xs text-muted-foreground">{(c.views || 0).toLocaleString()} อ่าน</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== NOVELS MANAGEMENT =====
function NovelsTab() {
  const [novels, setNovels] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editNovel, setEditNovel] = useState<any>(null);
  const [form, setForm] = useState({ title: "", category: "Romance", description: "", coverUrl: "", ageRating: "ทั่วไป", author: "NiYAIFREE", status: "draft" });

  const load = () => api.getNovels({ search, limit: "50" }).then(d => setNovels(d.novels)).catch(() => toast.error("ไม่สามารถโหลดรายการนิยายได้"));
  useEffect(() => { load(); }, [search]);

  const handleSave = async () => {
    try {
      if (editNovel) {
        await api.updateNovel(editNovel.id, form);
        toast.success("อัปเดตแล้ว");
      } else {
        await api.createNovel(form);
        toast.success("เพิ่มนิยายแล้ว");
      }
      setShowAdd(false); setEditNovel(null); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันลบนิยายนี้?")) return;
    try { await api.deleteNovel(id); toast.success("ลบแล้ว"); load(); } catch (e: any) { toast.error(e.message); }
  };

  const categories = ["Romance", "CEO", "Mafia", "BL", "Fantasy", "System", "เกิดใหม่", "Horror", "ดราม่า", "คอมเมดี้", "ลึกลับ", "ผจญภัย"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Kanit" }}>จัดการนิยาย</h1>
        <Button onClick={() => { setShowAdd(true); setEditNovel(null); setForm({ title: "", category: "Romance", description: "", coverUrl: "", ageRating: "ทั่วไป", author: "NiYAIFREE", status: "draft" }); }} className="text-white" style={{ background: "oklch(0.40 0.12 155)" }}>
          <Plus className="w-4 h-4 mr-1" /> เพิ่มนิยาย
        </Button>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหานิยาย..." className="w-full max-w-md px-4 py-2 border rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30" />

      {/* Add/Edit modal */}
      {(showAdd || editNovel) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setEditNovel(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold" style={{ fontFamily: "Kanit" }}>{editNovel ? "แก้ไขนิยาย" : "เพิ่มนิยายใหม่"}</h2>
            <div>
              <label className="block text-sm font-medium mb-1">ชื่อเรื่อง</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">เรทอายุ</label>
                <select value={form.ageRating} onChange={e => setForm(f => ({ ...f, ageRating: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="ทั่วไป">ทั่วไป</option>
                  <option value="13+">13+</option>
                  <option value="18+">18+</option>
                  <option value="20+">20+</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ผู้แต่ง</label>
              <input type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">เรื่องย่อ</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL ปก</label>
              <input type="text" value={form.coverUrl} onChange={e => setForm(f => ({ ...f, coverUrl: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">สถานะ</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="draft">แบบร่าง</option>
                <option value="writing">กำลังเขียน</option>
                <option value="completed">เสร็จสมบูรณ์</option>
                <option value="published">เผยแพร่</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowAdd(false); setEditNovel(null); }}>ยกเลิก</Button>
              <Button onClick={handleSave} className="text-white" style={{ background: "oklch(0.40 0.12 155)" }}>บันทึก</Button>
            </div>
          </div>
        </div>
      )}

      {/* Novels list */}
      <div className="space-y-2">
        {novels.map(n => (
          <div key={n.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {n.coverUrl ? <img src={n.coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black flex items-center justify-center"><span className="text-white text-[7px] text-center">{n.title}</span></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ fontFamily: "Kanit" }}>{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.category} · {n.totalChapters} ตอน · {n.viewCount} อ่าน · {n.status}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditNovel(n); setForm({ title: n.title, category: n.category, description: n.description || "", coverUrl: n.coverUrl || "", ageRating: n.ageRating || "ทั่วไป", author: n.author || "NiYAIFREE", status: n.status }); }} className="p-2 rounded-lg hover:bg-muted"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-red-50 text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== USERS MANAGEMENT =====
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const load = () => api.getUsers({ search }).then(setUsers).catch(() => toast.error("ไม่สามารถโหลดรายการสมาชิกได้"));
  useEffect(() => { load(); }, [search]);

  const toggleActive = async (u: any) => {
    try { await api.updateUser(u.id, { isActive: !u.isActive }); toast.success("อัปเดตแล้ว"); load(); } catch (e: any) { toast.error(e.message); }
  };

  const adjustPoints = async (u: any) => {
    const pts = prompt("ใส่จำนวนแต้มใหม่:", String(u.points));
    if (pts === null) return;
    try { await api.updateUser(u.id, { points: parseInt(pts) }); toast.success("อัปเดตแต้มแล้ว"); load(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Kanit" }}>จัดการสมาชิก</h1>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาสมาชิก..." className="w-full max-w-md px-4 py-2 border rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold">รหัส</th>
                <th className="text-left p-3 font-semibold">ชื่อผู้ใช้</th>
                <th className="text-left p-3 font-semibold">ชื่อ</th>
                <th className="text-left p-3 font-semibold">อีเมล</th>
                <th className="text-left p-3 font-semibold">บทบาท</th>
                <th className="text-left p-3 font-semibold">แต้ม</th>
                <th className="text-left p-3 font-semibold">สถานะ</th>
                <th className="text-left p-3 font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{u.memberId}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.firstName} {u.lastName}</td>
                  <td className="p-3 text-xs">{u.email}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${u.role === "ceo" ? "bg-yellow-100 text-yellow-800" : u.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>{u.role}</span></td>
                  <td className="p-3 font-semibold cursor-pointer hover:text-primary" onClick={() => adjustPoints(u)}>{u.points}</td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(u)} className={`px-2 py-0.5 rounded text-xs font-semibold ${u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {u.isActive ? "ใช้งาน" : "ระงับ"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => adjustPoints(u)} className="text-xs text-primary hover:underline">ปรับแต้ม</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== DOONOVEL (AI Generate) =====
function GenerateTab() {
  const [novelId, setNovelId] = useState("");
  const [numCalls, setNumCalls] = useState(1);
  const [startChapter, setStartChapter] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [novels, setNovels] = useState<any[]>([]);

  useEffect(() => { api.getNovels({ limit: "100" }).then(d => setNovels(d.novels)).catch(() => {}); }, []);

  const handleGenerate = async () => {
    if (!novelId) { toast.error("เลือกนิยายก่อน"); return; }
    setLoading(true);
    const toastId = toast.loading(`กำลังสร้าง ${numCalls * 3} ตอนด้วย AI... กรุณารอสักครู่`);
    try {
      const res = await api.aiGenerateChapters({ novelId: parseInt(novelId), numCalls, startChapter });
      setResult(res);
      toast.success(`สร้างสำเร็จ ${res.chaptersCreated} ตอน`, { id: toastId });
    } catch (e: any) { toast.error(e.message, { id: toastId }); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Kanit" }}>
        <Wand2 className="w-6 h-6 inline mr-2" style={{ color: "oklch(0.72 0.16 60)" }} />
        DOONOVEL — AI สร้างนิยาย
      </h1>
      <p className="text-sm text-muted-foreground mb-6">ใช้ Gemini 2.5 Flash Lite สร้างตอนนิยายอัตโนมัติ (1 call = 3 ตอน)</p>

      <div className="bg-white rounded-xl border p-6 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">เลือกนิยาย</label>
          <select value={novelId} onChange={e => setNovelId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">-- เลือกนิยาย --</option>
            {novels.map(n => <option key={n.id} value={n.id}>{n.title} ({n.totalChapters} ตอน)</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">จำนวน API Call</label>
            <input type="number" min={1} max={20} value={numCalls} onChange={e => setNumCalls(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <p className="text-xs text-muted-foreground mt-1">1 call = 3 ตอน</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">เริ่มจากตอนที่</label>
            <input type="number" min={1} value={startChapter} onChange={e => setStartChapter(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full text-white font-semibold" style={{ background: "oklch(0.72 0.16 60)" }}>
          <Zap className="w-4 h-4 mr-2" /> {loading ? "กำลังสร้าง..." : `สร้าง ${numCalls * 3} ตอน`}
        </Button>

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-semibold text-green-800">สร้างสำเร็จ {result.chaptersCreated} ตอน</p>
            <div className="mt-2 space-y-1">
              {result.results?.map((r: any, i: number) => (
                <p key={i} className="text-xs text-green-700">
                  {r.error ? `Error: ${r.error}` : `ตอนที่ ${r.chapterNumber}: ${r.title} (${r.wordCount} คำ)`}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== DOOPROOF (Proofread) =====
function ProofTab() {
  const [novelId, setNovelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [novels, setNovels] = useState<any[]>([]);

  useEffect(() => { api.getNovels({ limit: "100" }).then(d => setNovels(d.novels)).catch(() => {}); }, []);

  const handleProof = async () => {
    setLoading(true);
    const toastId = toast.loading("กำลังพิสูจน์อักษรด้วย AI... กรุณารอสักครู่");
    try {
      const res = await api.proofread({ novelId: novelId ? parseInt(novelId) : undefined });
      setResult(res);
      toast.success(`ตรวจสอบแล้ว ${res.processed} ตอน`, { id: toastId });
    } catch (e: any) { toast.error(e.message, { id: toastId }); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Kanit" }}>
        <PenTool className="w-6 h-6 inline mr-2" style={{ color: "oklch(0.40 0.12 155)" }} />
        DOOPROOF — พิสูจน์อักษร AI
      </h1>
      <p className="text-sm text-muted-foreground mb-6">ตรวจสอบคุณภาพ แก้ไขคำผิด ให้คะแนน (ผ่าน 90+)</p>

      <div className="bg-white rounded-xl border p-6 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">เลือกนิยาย (ว่างไว้ = ตรวจทั้งหมด)</label>
          <select value={novelId} onChange={e => setNovelId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">ตรวจทั้งหมดที่ยังไม่ผ่าน</option>
            {novels.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
          </select>
        </div>
        <Button onClick={handleProof} disabled={loading} className="w-full text-white font-semibold" style={{ background: "oklch(0.40 0.12 155)" }}>
          <CheckCircle className="w-4 h-4 mr-2" /> {loading ? "กำลังตรวจสอบ..." : "เริ่มพิสูจน์อักษร (20 ตอน)"}
        </Button>

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-semibold text-blue-800">ตรวจสอบแล้ว {result.processed} ตอน</p>
            <div className="mt-2 space-y-1">
              {result.results?.map((r: any, i: number) => (
                <p key={i} className="text-xs">
                  {r.error ? <span className="text-red-600">Error: {r.error}</span> :
                    <span className={r.score >= 90 ? "text-green-700" : "text-orange-600"}>
                      ตอน #{r.chapterId}: คะแนน {r.score} {r.score >= 90 ? "ผ่าน" : "ไม่ผ่าน"} ({r.issues} ปัญหา)
                    </span>}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== API KEYS =====
function ApiKeysTab() {
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState("");
  const load = () => api.getApiKeys().then(setKeys).catch(() => toast.error("ไม่สามารถโหลด API Keys ได้"));
  useEffect(() => { load(); }, []);

  const addKey = async () => {
    if (!newKey.trim()) return;
    try { await api.addApiKey({ keyValue: newKey.trim() }); setNewKey(""); toast.success("เพิ่ม API Key แล้ว"); load(); } catch (e: any) { toast.error(e.message); }
  };

  const deleteKey = async (id: number) => {
    if (!confirm("ยืนยันลบ API Key นี้?")) return;
    try { await api.deleteApiKey(id); toast.success("ลบแล้ว"); load(); } catch (e: any) { toast.error(e.message); }
  };

  const toggleKey = async (k: any) => {
    try { await api.toggleApiKey(k.id, !k.isActive); toast.success("อัปเดตแล้ว"); load(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Kanit" }}>
        <Key className="w-6 h-6 inline mr-2" style={{ color: "oklch(0.72 0.16 60)" }} />
        จัดการ API Keys (Gemini)
      </h1>
      <div className="bg-white rounded-xl border p-6 mb-4">
        <div className="flex gap-2">
          <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="ใส่ Gemini API Key..." className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <Button onClick={addKey} className="text-white" style={{ background: "oklch(0.40 0.12 155)" }}>
            <Plus className="w-4 h-4 mr-1" /> เพิ่ม
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {keys.map((k, i) => (
          <div key={k.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: k.isActive ? "oklch(0.40 0.12 155)" : "#999" }}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono truncate">{k.keyValue.slice(0, 20)}...{k.keyValue.slice(-8)}</p>
              <p className="text-xs text-muted-foreground">ใช้ไป {k.usageCount} ครั้ง · {k.lastUsedAt ? `ล่าสุด ${new Date(k.lastUsedAt).toLocaleString("th-TH")}` : "ยังไม่ได้ใช้"}</p>
            </div>
            <button onClick={() => toggleKey(k)} className={`px-3 py-1 rounded text-xs font-semibold ${k.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {k.isActive ? "เปิด" : "ปิด"}
            </button>
            <button onClick={() => deleteKey(k.id)} className="p-2 rounded-lg hover:bg-red-50 text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {keys.length === 0 && <p className="text-center py-8 text-muted-foreground">ยังไม่มี API Key — เพิ่มเพื่อใช้ AI Generate</p>}
      </div>
    </div>
  );
}

// ===== ADSENSE MANAGEMENT =====
function AdSenseTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const adsenseKeys = [
    'adsense_verification_method', 'adsense_publisher_id', 'adsense_code',
    'ads_txt_content', 'adsense_meta_tag', 'adsense_auto_ads',
    'adsense_header', 'adsense_sidebar', 'adsense_content',
    'adsense_in_article', 'adsense_in_feed', 'adsense_matched_content'
  ];

  useEffect(() => {
    api.getSettings().then((all: any[]) => {
      const map: Record<string, string> = {};
      all.filter((s: any) => adsenseKeys.includes(s.settingKey)).forEach((s: any) => { map[s.settingKey] = s.settingValue || ''; });
      // Ensure all keys exist
      adsenseKeys.forEach(k => { if (!(k in map)) map[k] = ''; });
      setSettings(map);
    }).catch(() => toast.error("ไม่สามารถโหลดการตั้งค่า AdSense ได้")).finally(() => setLoading(false));
  }, []);

  const update = (key: string, val: string) => setSettings(s => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("กำลังบันทึก...");
    try {
      await api.updateSettings(settings);
      toast.success("บันทึกการตั้งค่า AdSense สำเร็จ!", { id: toastId });
    } catch (e: any) { toast.error(e.message || "บันทึกไม่สำเร็จ", { id: toastId }); }
    setSaving(false);
  };

  const method = settings.adsense_verification_method || 'ads_txt';

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "Kanit" }}>Google AdSense</h1>
      <p className="text-sm text-muted-foreground mb-6">จัดการโค้ดโฆษณาและการยืนยันเว็บไซต์กับ Google AdSense</p>

      {/* Publisher ID */}
      <div className="bg-white rounded-xl border p-6 mb-6 max-w-3xl">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Kanit" }}>Publisher ID</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Publisher ID (pub-xxxxxxxxxx)</label>
            <input type="text" value={settings.adsense_publisher_id} onChange={e => update('adsense_publisher_id', e.target.value)} placeholder="pub-1234567890123456" className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </div>

      {/* Verification Method */}
      <div className="bg-white rounded-xl border p-6 mb-6 max-w-3xl">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Kanit" }}>เลือกวิธีการยืนยัน</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { id: 'adsense_code', label: 'ข้อมูลโค้ด AdSense', desc: 'วางโค้ดใน <head> ของเว็บไซต์' },
            { id: 'ads_txt', label: 'ข้อมูลโค้ด Ads.txt', desc: 'อัปโหลดไฟล์ ads.txt ไปยังรูทของเว็บไซต์' },
            { id: 'meta_tag', label: 'เมตาแท็ก', desc: 'วางเมตาแท็กใน <head> เพื่อยืนยัน' },
          ].map(opt => (
            <label key={opt.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all flex-1 min-w-[200px] ${method === opt.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="verification" value={opt.id} checked={method === opt.id} onChange={() => update('adsense_verification_method', opt.id)} className="mt-1 accent-primary" />
              <div>
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Conditional fields based on method */}
        {method === 'adsense_code' && (
          <div className="space-y-3 p-4 rounded-lg" style={{ background: "oklch(0.97 0.005 155)" }}>
            <label className="block text-sm font-medium">โค้ด AdSense (วางใน &lt;head&gt;)</label>
            <textarea value={settings.adsense_code} onChange={e => update('adsense_code', e.target.value)} rows={5} placeholder='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>' className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
            <p className="text-xs text-muted-foreground">คัดลอกโค้ดจากหน้า AdSense แล้ววางที่นี่</p>
          </div>
        )}

        {method === 'ads_txt' && (
          <div className="space-y-3 p-4 rounded-lg" style={{ background: "oklch(0.97 0.005 155)" }}>
            <label className="block text-sm font-medium">เนื้อหาไฟล์ ads.txt</label>
            <textarea value={settings.ads_txt_content} onChange={e => update('ads_txt_content', e.target.value)} rows={5} placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0" className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
            <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
              <p className="text-xs text-blue-800">
                ในการเตรียมเว็บไซต์ให้พร้อมแสดงโฆษณา ให้คัดลอกข้อความด้านล่างแล้ววางไว้ในไฟล์ ads.txt แต่ละไฟล์ จากนั้นอัปโหลดไปยังไดเรกทอรีรูทของเว็บไซต์ หากมีไฟล์ ads.txt อยู่แล้ว ก็เพียงวางข้อความลงในแต่ละไฟล์{" "}
                <a href="https://support.google.com/adsense/answer/7532444" target="_blank" rel="noopener" className="font-semibold text-blue-700 underline">ดูข้อมูลเพิ่มเติมเกี่ยวกับการสร้างไฟล์ ads.txt</a>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">ไฟล์ ads.txt จะถูกสร้างอัตโนมัติที่ <span className="font-mono font-semibold">yourdomain.com/ads.txt</span></p>
          </div>
        )}

        {method === 'meta_tag' && (
          <div className="space-y-3 p-4 rounded-lg" style={{ background: "oklch(0.97 0.005 155)" }}>
            <label className="block text-sm font-medium">เมตาแท็กยืนยัน</label>
            <textarea value={settings.adsense_meta_tag} onChange={e => update('adsense_meta_tag', e.target.value)} rows={3} placeholder='<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">' className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
            <p className="text-xs text-muted-foreground">คัดลอกเมตาแท็กจากหน้า AdSense แล้ววางที่นี่</p>
          </div>
        )}
      </div>

      {/* Ad Placement Codes */}
      <div className="bg-white rounded-xl border p-6 mb-6 max-w-3xl">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Kanit" }}>โค้ดโฆษณาตำแหน่งต่างๆ</h2>
        <p className="text-sm text-muted-foreground mb-4">วางโค้ด Ad Unit สำหรับแต่ละตำแหน่งบนหน้าเว็บ</p>
        <div className="space-y-4">
          {[
            { key: 'adsense_auto_ads', label: 'Auto Ads (โฆษณาอัตโนมัติ)', placeholder: '<script>...</script>', rows: 3 },
            { key: 'adsense_header', label: 'Header Ad (ด้านบน)', placeholder: '<ins class="adsbygoogle" ...></ins><script>...</script>', rows: 3 },
            { key: 'adsense_sidebar', label: 'Sidebar Ad (ด้านข้าง)', placeholder: '<ins class="adsbygoogle" ...></ins><script>...</script>', rows: 3 },
            { key: 'adsense_content', label: 'Content Ad (ในเนื้อหา)', placeholder: '<ins class="adsbygoogle" ...></ins><script>...</script>', rows: 3 },
            { key: 'adsense_in_article', label: 'In-Article Ad (ระหว่างบทความ)', placeholder: '<ins class="adsbygoogle" ...></ins><script>...</script>', rows: 3 },
            { key: 'adsense_in_feed', label: 'In-Feed Ad (ในรายการ)', placeholder: '<ins class="adsbygoogle" ...></ins><script>...</script>', rows: 3 },
            { key: 'adsense_matched_content', label: 'Matched Content (เนื้อหาที่ตรงกัน)', placeholder: '<ins class="adsbygoogle" ...></ins><script>...</script>', rows: 3 },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <textarea value={settings[field.key] || ''} onChange={e => update(field.key, e.target.value)} rows={field.rows} placeholder={field.placeholder} className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y" />
            </div>
          ))}
        </div>
      </div>

      {/* Preview & Status */}
      <div className="bg-white rounded-xl border p-6 mb-6 max-w-3xl">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Kanit" }}>สถานะการตั้งค่า</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg border-2 text-center ${settings.adsense_publisher_id ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <CheckCircle className={`w-5 h-5 mx-auto mb-1 ${settings.adsense_publisher_id ? 'text-green-600' : 'text-gray-400'}`} />
            <p className="text-xs font-semibold">Publisher ID</p>
            <p className="text-[10px] text-muted-foreground">{settings.adsense_publisher_id ? 'ตั้งค่าแล้ว' : 'ยังไม่ได้ตั้งค่า'}</p>
          </div>
          <div className={`p-3 rounded-lg border-2 text-center ${(method === 'adsense_code' && settings.adsense_code) || (method === 'ads_txt' && settings.ads_txt_content) || (method === 'meta_tag' && settings.adsense_meta_tag) ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <CheckCircle className={`w-5 h-5 mx-auto mb-1 ${(method === 'adsense_code' && settings.adsense_code) || (method === 'ads_txt' && settings.ads_txt_content) || (method === 'meta_tag' && settings.adsense_meta_tag) ? 'text-green-600' : 'text-gray-400'}`} />
            <p className="text-xs font-semibold">การยืนยัน</p>
            <p className="text-[10px] text-muted-foreground">{method === 'adsense_code' ? 'AdSense Code' : method === 'ads_txt' ? 'Ads.txt' : 'Meta Tag'}</p>
          </div>
          <div className={`p-3 rounded-lg border-2 text-center ${settings.adsense_auto_ads || settings.adsense_header || settings.adsense_content ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <CheckCircle className={`w-5 h-5 mx-auto mb-1 ${settings.adsense_auto_ads || settings.adsense_header || settings.adsense_content ? 'text-green-600' : 'text-gray-400'}`} />
            <p className="text-xs font-semibold">โค้ดโฆษณา</p>
            <p className="text-[10px] text-muted-foreground">{[settings.adsense_auto_ads && 'Auto', settings.adsense_header && 'Header', settings.adsense_content && 'Content'].filter(Boolean).join(', ') || 'ยังไม่ได้ตั้งค่า'}</p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <Button onClick={handleSave} disabled={saving} className="text-white font-semibold px-8 py-2.5" style={{ background: "oklch(0.40 0.12 155)" }}>
        {saving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> กำลังบันทึก...</> : <><CheckCircle className="w-4 h-4 mr-2" /> บันทึกการตั้งค่า AdSense</>}
      </Button>
    </div>
  );
}

// ===== SETTINGS =====
function SettingsTab() {
  const [settings, setSettings] = useState<any[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const load = () => api.getSettings().then(setSettings).catch(() => toast.error("ไม่สามารถโหลดการตั้งค่าได้"));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try { await api.updateSettings(edited); toast.success("บันทึกแล้ว"); setEdited({}); load(); } catch (e: any) { toast.error(e.message); }
  };

  const labels: Record<string, string> = {
    points_signup: "แต้มสมัครสมาชิก", points_referral: "แต้มแนะนำเพื่อน", points_share: "แต้มแชร์",
    points_watch_ad: "แต้มดูโฆษณา", points_mini_game_min: "แต้มมินิเกม (ต่ำสุด)", points_mini_game_max: "แต้มมินิเกม (สูงสุด)",
    points_per_chapter: "แต้มต่อตอน", free_read_days: "อ่านฟรี (วัน)", adsense_header: "AdSense Header",
    adsense_sidebar: "AdSense Sidebar", adsense_content: "AdSense Content", site_name: "ชื่อเว็บ",
    site_description: "คำอธิบายเว็บ", gemini_model: "Gemini Model", chapters_per_call: "ตอน/API Call",
    words_per_chapter_min: "คำ/ตอน (ต่ำสุด)", words_per_chapter_max: "คำ/ตอน (สูงสุด)", parallel_novels: "นิยายพร้อมกัน",
    quality_pass_score: "คะแนนผ่าน QC",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Kanit" }}>ตั้งค่าระบบ</h1>
      <div className="bg-white rounded-xl border p-6 space-y-4 max-w-2xl">
        {settings.map(s => (
          <div key={s.id} className="flex items-center gap-4">
            <label className="w-48 text-sm font-medium flex-shrink-0">{labels[s.settingKey] || s.settingKey}</label>
            <input
              type="text"
              value={edited[s.settingKey] !== undefined ? edited[s.settingKey] : s.settingValue}
              onChange={e => setEdited(ed => ({ ...ed, [s.settingKey]: e.target.value }))}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        ))}
        {Object.keys(edited).length > 0 && (
          <Button onClick={handleSave} className="text-white" style={{ background: "oklch(0.40 0.12 155)" }}>
            บันทึกการเปลี่ยนแปลง
          </Button>
        )}
      </div>
    </div>
  );
}
