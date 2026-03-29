/*
  NiYAIFREE Analytics Dashboard — PUBLIC
  Time filters: hourly, daily, weekly, monthly, quarterly, yearly
  Started: 28 March 2569
*/
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import {
  BarChart3, Eye, Users, Globe, TrendingUp, Clock, BookOpen,
  ArrowLeft, RefreshCw, Monitor, Crown,
  Activity, MapPin, Layers, ArrowUpRight, ArrowDownRight
} from "lucide-react";

interface DashboardData {
  totalPageviews: number;
  uniqueVisitors: number;
  uniqueIPs: number;
  pageviewsByDay: { date: string; views: number; visitors: number }[];
  topPages: { page: string; views: number; visitors: number }[];
  topCountries: { country: string; views: number; uniqueIPs: number }[];
  topNovels: { novelId: number; title: string; category: string; coverUrl: string; views: number; visitors: number }[];
  topNovelsByViewCount: { id: number; title: string; category: string; coverUrl: string; viewCount: number; likeCount: number }[];
  hourlyDistribution: { hour: number; views: number }[];
  recentPageviews: { page: string; ip: string; country: string; city: string; createdAt: string; userAgent: string }[];
  startDate: string;
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

function getDeviceType(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}

function getBrowser(ua: string): string {
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/edg/i.test(ua)) return "Edge";
  return "Other";
}

const TIME_RANGES = [
  { label: "1 ชม.", value: 1, desc: "ชั่วโมงที่ผ่านมา" },
  { label: "6 ชม.", value: 1, desc: "6 ชั่วโมงที่ผ่านมา" },
  { label: "24 ชม.", value: 1, desc: "24 ชั่วโมงที่ผ่านมา" },
  { label: "7 วัน", value: 7, desc: "สัปดาห์ที่ผ่านมา" },
  { label: "30 วัน", value: 30, desc: "เดือนที่ผ่านมา" },
  { label: "90 วัน", value: 90, desc: "ไตรมาสที่ผ่านมา" },
  { label: "6 เดือน", value: 180, desc: "6 เดือนที่ผ่านมา" },
  { label: "1 ปี", value: 365, desc: "ปีที่ผ่านมา" },
  { label: "ทั้งหมด", value: 9999, desc: "ตั้งแต่เริ่มต้น" },
];

function SimpleBarChart({ data, maxVal, color }: { data: { label: string; value: number }[]; maxVal: number; color: string }) {
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-8 text-right shrink-0">{d.label}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full rounded-full ${color} transition-all duration-500`}
              style={{ width: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%`, minWidth: d.value > 0 ? "8px" : "0" }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 w-12 text-right">{formatNum(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRange, setSelectedRange] = useState(4); // index into TIME_RANGES, default 30 days
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "countries" | "novels" | "realtime">("overview");
  const [refreshing, setRefreshing] = useState(false);

  const days = TIME_RANGES[selectedRange].value;
  const rangeDesc = TIME_RANGES[selectedRange].desc;

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const result = await api.getAnalyticsDashboard(days);
      setData(result);
    } catch (e: any) {
      setError(e.message || "ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [selectedRange]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const todayViews = useMemo(() => {
    if (!data?.pageviewsByDay?.length) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return data.pageviewsByDay.find(d => d.date?.slice(0, 10) === today)?.views || 0;
  }, [data]);

  const yesterdayViews = useMemo(() => {
    if (!data?.pageviewsByDay?.length) return 0;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    return data.pageviewsByDay.find(d => d.date?.slice(0, 10) === yesterday)?.views || 0;
  }, [data]);

  const growthPercent = useMemo(() => {
    if (yesterdayViews === 0) return todayViews > 0 ? 100 : 0;
    return Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100);
  }, [todayViews, yesterdayViews]);

  const deviceStats = useMemo(() => {
    if (!data?.recentPageviews) return { mobile: 0, desktop: 0, tablet: 0 };
    const stats = { mobile: 0, desktop: 0, tablet: 0 };
    data.recentPageviews.forEach(pv => {
      const type = getDeviceType(pv.userAgent).toLowerCase() as keyof typeof stats;
      if (type in stats) stats[type]++;
    });
    return stats;
  }, [data]);

  const browserStats = useMemo(() => {
    if (!data?.recentPageviews) return {};
    const stats: Record<string, number> = {};
    data.recentPageviews.forEach(pv => {
      const browser = getBrowser(pv.userAgent);
      stats[browser] = (stats[browser] || 0) + 1;
    });
    return stats;
  }, [data]);

  const tabs = [
    { id: "overview" as const, label: "ภาพรวม", icon: BarChart3 },
    { id: "pages" as const, label: "หน้าเพจ", icon: Layers },
    { id: "countries" as const, label: "ประเทศ", icon: Globe },
    { id: "novels" as const, label: "นิยายยอดนิยม", icon: BookOpen },
    { id: "realtime" as const, label: "เรียลไทม์", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 text-slate-400 hover:text-slate-700 transition-colors no-underline">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold font-[Kanit] text-slate-900">สถิติการเข้าชม</h1>
                  <p className="text-[10px] text-slate-400 -mt-0.5">NiYaiFree — เริ่มนับ 28 มี.ค. 2569</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Time Range Selector - Full width, scrollable */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-slate-700 font-[Kanit]">ช่วงเวลา</span>
            <span className="text-xs text-slate-400">— {rangeDesc}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map((range, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRange(idx)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all border ${
                  selectedRange === idx
                    ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">กำลังโหลดข้อมูลสถิติ...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={handleRefresh} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">ลองใหม่</button>
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Pageviews",
                  value: formatNum(data.totalPageviews),
                  sub: `วันนี้ ${formatNum(todayViews)}`,
                  icon: Eye,
                  bgColor: "bg-blue-50",
                  textColor: "text-blue-600",
                  growth: growthPercent,
                },
                {
                  label: "Visitors",
                  value: formatNum(data.uniqueVisitors),
                  sub: rangeDesc,
                  icon: Users,
                  bgColor: "bg-emerald-50",
                  textColor: "text-emerald-600",
                },
                {
                  label: "Unique IPs",
                  value: formatNum(data.uniqueIPs),
                  sub: rangeDesc,
                  icon: Monitor,
                  bgColor: "bg-violet-50",
                  textColor: "text-violet-600",
                },
                {
                  label: "ประเทศ",
                  value: String(data.topCountries?.length || 0),
                  sub: "ที่เข้าชม",
                  icon: Globe,
                  bgColor: "bg-amber-50",
                  textColor: "text-amber-600",
                },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.textColor}`} />
                    </div>
                    {card.growth !== undefined && (
                      <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        card.growth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      }`}>
                        {card.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(card.growth)}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold font-[Kanit] text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100 shadow-sm mb-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Pageviews Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold font-[Kanit] text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Pageviews รายวัน
                    </h3>
                    <span className="text-xs text-slate-400">{rangeDesc}</span>
                  </div>
                  {data.pageviewsByDay?.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-end gap-1 h-40">
                        {data.pageviewsByDay.map((d, i) => {
                          const maxViews = Math.max(...data.pageviewsByDay.map(x => x.views), 1);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.date?.slice(5)} — {d.views} views
                              </div>
                              <div
                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-500 min-w-[4px]"
                                style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: d.views > 0 ? "4px" : "0" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 px-1">
                        <span>{data.pageviewsByDay[0]?.date?.slice(5)}</span>
                        <span>{data.pageviewsByDay[data.pageviewsByDay.length - 1]?.date?.slice(5)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">ยังไม่มีข้อมูล — เริ่มนับตั้งแต่ 28 มี.ค. 2569</p>
                    </div>
                  )}
                </div>

                {/* Hourly + Device */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-bold font-[Kanit] text-slate-900 flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-violet-500" />
                      ช่วงเวลาที่เข้าชม (รายชั่วโมง)
                    </h3>
                    {data.hourlyDistribution?.length > 0 ? (
                      <SimpleBarChart
                        data={data.hourlyDistribution.map(h => ({
                          label: `${String(h.hour).padStart(2, "0")}`,
                          value: h.views,
                        }))}
                        maxVal={Math.max(...data.hourlyDistribution.map(h => h.views), 1)}
                        color="bg-gradient-to-r from-violet-400 to-violet-500"
                      />
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-8">ยังไม่มีข้อมูล</p>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-bold font-[Kanit] text-slate-900 flex items-center gap-2 mb-4">
                      <Monitor className="w-5 h-5 text-emerald-500" />
                      อุปกรณ์ & เบราว์เซอร์
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">อุปกรณ์</p>
                        <div className="flex gap-3">
                          {Object.entries(deviceStats).map(([type, count]) => (
                            <div key={type} className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                              <p className="text-lg font-bold text-slate-900">{count}</p>
                              <p className="text-[10px] text-slate-500 capitalize">{type}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">เบราว์เซอร์</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(browserStats).sort((a, b) => b[1] - a[1]).map(([browser, count]) => (
                            <span key={browser} className="px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-medium text-slate-700">
                              {browser} <span className="text-slate-400">({count})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold font-[Kanit] text-slate-900 flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    สรุปรายสัปดาห์
                  </h3>
                  {data.pageviewsByDay?.length >= 7 ? (() => {
                    const weeks: { label: string; views: number; visitors: number }[] = [];
                    const sorted = [...data.pageviewsByDay].sort((a, b) => a.date.localeCompare(b.date));
                    for (let i = 0; i < sorted.length; i += 7) {
                      const chunk = sorted.slice(i, i + 7);
                      const views = chunk.reduce((s, d) => s + d.views, 0);
                      const visitors = chunk.reduce((s, d) => s + d.visitors, 0);
                      const start = chunk[0]?.date?.slice(5) || "";
                      const end = chunk[chunk.length - 1]?.date?.slice(5) || "";
                      weeks.push({ label: `${start} - ${end}`, views, visitors });
                    }
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                              <th className="px-4 py-2 text-left font-semibold">สัปดาห์</th>
                              <th className="px-4 py-2 text-right font-semibold">Views</th>
                              <th className="px-4 py-2 text-right font-semibold">Visitors</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {weeks.map((w, i) => (
                              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-4 py-2 text-sm text-slate-700">{w.label}</td>
                                <td className="px-4 py-2 text-right text-sm font-bold text-blue-600">{formatNum(w.views)}</td>
                                <td className="px-4 py-2 text-right text-sm text-slate-600">{formatNum(w.visitors)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })() : (
                    <p className="text-sm text-slate-400 text-center py-8">ต้องมีข้อมูลอย่างน้อย 7 วัน</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "pages" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold font-[Kanit] text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    หน้าเพจยอดนิยม
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3 text-left font-semibold">#</th>
                        <th className="px-6 py-3 text-left font-semibold">หน้าเพจ</th>
                        <th className="px-6 py-3 text-right font-semibold">Views</th>
                        <th className="px-6 py-3 text-right font-semibold">Visitors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.topPages?.length > 0 ? data.topPages.map((page, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-3 text-sm text-slate-400 font-mono">{i + 1}</td>
                          <td className="px-6 py-3">
                            <span className="text-sm font-medium text-slate-900 font-mono">{page.page}</span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="text-sm font-bold text-blue-600">{formatNum(page.views)}</span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="text-sm text-slate-600">{formatNum(page.visitors)}</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">ยังไม่มีข้อมูล</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "countries" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold font-[Kanit] text-slate-900 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-amber-500" />
                    การเข้าชมตามประเทศ
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3 text-left font-semibold">#</th>
                        <th className="px-6 py-3 text-left font-semibold">ประเทศ</th>
                        <th className="px-6 py-3 text-right font-semibold">Views</th>
                        <th className="px-6 py-3 text-right font-semibold">Unique IPs</th>
                        <th className="px-6 py-3 text-right font-semibold">สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.topCountries?.length > 0 ? data.topCountries.map((c, i) => {
                        const totalViews = data.topCountries.reduce((sum, x) => sum + x.views, 0);
                        const pct = totalViews > 0 ? ((c.views / totalViews) * 100).toFixed(1) : "0";
                        return (
                          <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-6 py-3 text-sm text-slate-400">{i + 1}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-medium text-slate-900">{c.country || "ไม่ทราบ"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="text-sm font-bold text-amber-600">{formatNum(c.views)}</span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="text-sm text-slate-600">{formatNum(c.uniqueIPs)}</span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">ยังไม่มีข้อมูล</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "novels" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold font-[Kanit] text-slate-900 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      นิยายยอดนิยม TOP 100
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">จัดอันดับตามยอดวิวสะสม</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-3 text-left font-semibold w-12">อันดับ</th>
                          <th className="px-4 py-3 text-left font-semibold">นิยาย</th>
                          <th className="px-4 py-3 text-left font-semibold">หมวดหมู่</th>
                          <th className="px-4 py-3 text-right font-semibold">ยอดวิว</th>
                          <th className="px-4 py-3 text-right font-semibold">ยอดชอบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {data.topNovelsByViewCount?.length > 0 ? data.topNovelsByViewCount.map((novel, i) => (
                          <tr key={novel.id} className={`hover:bg-blue-50/30 transition-colors ${i < 3 ? "bg-amber-50/20" : ""}`}>
                            <td className="px-4 py-3">
                              {i < 3 ? (
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                                  i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : "bg-amber-700"
                                }`}>
                                  {i + 1}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-400 pl-2">{i + 1}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {novel.coverUrl ? (
                                  <img src={novel.coverUrl} alt="" className="w-10 h-14 object-cover rounded-md shadow-sm" />
                                ) : (
                                  <div className="w-10 h-14 bg-slate-200 rounded-md flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                                <Link href={`/novel/${novel.id}`} className="text-sm font-medium text-slate-900 line-clamp-2 no-underline hover:text-blue-600 transition-colors">
                                  {novel.title}
                                </Link>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{novel.category}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-bold text-blue-600">{formatNum(novel.viewCount)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-pink-500">{formatNum(novel.likeCount)}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">ยังไม่มีข้อมูล</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "realtime" && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold font-[Kanit] text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    การเข้าชมล่าสุด
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-600 font-medium">Live</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3 text-left font-semibold">เวลา</th>
                        <th className="px-4 py-3 text-left font-semibold">หน้าเพจ</th>
                        <th className="px-4 py-3 text-left font-semibold">IP</th>
                        <th className="px-4 py-3 text-left font-semibold">ประเทศ</th>
                        <th className="px-4 py-3 text-left font-semibold">เมือง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.recentPageviews?.length > 0 ? data.recentPageviews.map((pv, i) => (
                        <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="text-xs text-slate-500 font-mono">
                              {new Date(pv.createdAt).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-medium text-slate-900 font-mono">{pv.page}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs text-slate-500 font-mono">{pv.ip?.substring(0, 15)}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs text-slate-600">{pv.country || "-"}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs text-slate-600">{pv.city || "-"}</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                            ยังไม่มีข้อมูล — เริ่มนับตั้งแต่ 28 มี.ค. 2569
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center text-xs text-slate-400 pt-6 border-t border-slate-200">
          <p>NiYaiFree Analytics — เริ่มนับตั้งแต่ 28 มีนาคม 2569</p>
        </div>
      </div>
    </div>
  );
}
