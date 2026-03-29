const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("niyaifree_token");
}

export function setToken(token: string) {
  localStorage.setItem("niyaifree_token", token);
}

export function clearToken() {
  localStorage.removeItem("niyaifree_token");
  localStorage.removeItem("niyaifree_user");
}

export function getStoredUser() {
  const u = localStorage.getItem("niyaifree_user");
  return u ? JSON.parse(u) : null;
}

export function setStoredUser(user: any) {
  localStorage.setItem("niyaifree_user", JSON.stringify(user));
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: any = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
  return data;
}

export const api = {
  // Auth
  register: (body: any) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: any) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),

  // Novels (public)
  getNovels: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/novels${q}`);
  },
  getNovel: (slug: string) => request(`/novels/${slug}`),
  getChapter: (novelId: number, chapterNumber: number) => request(`/chapters/${novelId}/${chapterNumber}`),
  getCategories: () => request("/categories"),

  // Member
  addBookmark: (body: any) => request("/member/bookmark", { method: "POST", body: JSON.stringify(body) }),
  getBookmarks: () => request("/member/bookmarks"),
  logRead: (body: any) => request("/member/read-log", { method: "POST", body: JSON.stringify(body) }),
  getReadingHistory: () => request("/member/reading-history"),
  usePoints: (body: any) => request("/member/use-points", { method: "POST", body: JSON.stringify(body) }),
  earnPoints: (type: string) => request("/member/earn-points", { method: "POST", body: JSON.stringify({ type }) }),
  updateProfile: (body: any) => request("/member/profile", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body: any) => request("/member/change-password", { method: "POST", body: JSON.stringify(body) }),
  getPointHistory: () => request("/member/point-history"),

  // VIP & Coins
  subscribeVip: (body: any) => request("/member/subscribe-vip", { method: "POST", body: JSON.stringify(body) }),
  purchaseCoins: (body: any) => request("/member/purchase-coins", { method: "POST", body: JSON.stringify(body) }),
  getCoinHistory: () => request("/member/coin-history"),
  downloadEbook: (body: any) => request("/member/download-ebook", { method: "POST", body: JSON.stringify(body) }),
  getDownloadHistory: () => request("/member/download-history"),
  checkEbook: (novelId: number) => request(`/ebook/check/${novelId}`),
  generateEbookPdf: async (novelId: number) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/ebook/generate-pdf/${novelId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "ดาวน์โหลดล้มเหลว" }));
      throw new Error(err.error || "ดาวน์โหลดล้มเหลว");
    }
    return res.blob();
  },

  // Admin
  getStats: () => request("/admin/stats"),
  getUsers: (params?: Record<string, string>) => request(`/admin/users?${new URLSearchParams(params || {})}`),
  updateUser: (id: number, body: any) => request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  createNovel: (body: any) => request("/admin/novels", { method: "POST", body: JSON.stringify(body) }),
  updateNovel: (id: number, body: any) => request(`/admin/novels/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteNovel: (id: number) => request(`/admin/novels/${id}`, { method: "DELETE" }),
  createChapter: (body: any) => request("/admin/chapters", { method: "POST", body: JSON.stringify(body) }),
  updateChapter: (id: number, body: any) => request(`/admin/chapters/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteChapter: (id: number) => request(`/admin/chapters/${id}`, { method: "DELETE" }),
  getApiKeys: () => request("/admin/api-keys"),
  addApiKey: (body: any) => request("/admin/api-keys", { method: "POST", body: JSON.stringify(body) }),
  deleteApiKey: (id: number) => request(`/admin/api-keys/${id}`, { method: "DELETE" }),
  toggleApiKey: (id: number, isActive: boolean) => request(`/admin/api-keys/${id}`, { method: "PUT", body: JSON.stringify({ isActive }) }),
  getSettings: () => request("/admin/settings"),
  updateSettings: (body: any) => request("/admin/settings", { method: "PUT", body: JSON.stringify(body) }),
  generateNovel: (body: any) => request("/admin/generate-novel", { method: "POST", body: JSON.stringify(body) }),
  aiGenerateChapters: (body: any) => request("/admin/ai-generate-chapters", { method: "POST", body: JSON.stringify(body) }),
  proofread: (body: any) => request("/admin/proofread", { method: "POST", body: JSON.stringify(body) }),
  getJobs: () => request("/admin/jobs"),
  adjustUserCoins: (id: number, body: any) => request(`/admin/users/${id}/coins`, { method: "POST", body: JSON.stringify(body) }),

  // Analytics
  trackPageview: (body: any) => request("/analytics/track", { method: "POST", body: JSON.stringify(body) }),
  getPublicStats: () => request("/public/stats"),
  getAnalyticsDashboard: (days?: number) => request(`/analytics/dashboard?days=${days || 30}`),
  getAnalyticsContentStats: () => request("/analytics/content-stats"),

  // CEO
  ceoLogin: (body: any) => request("/ceo/login", { method: "POST", body: JSON.stringify(body) }),
  ceoStats: () => request("/ceo/stats"),
  getAuditLogs: (params?: Record<string, string>) => request(`/ceo/audit-logs?${new URLSearchParams(params || {})}`),
  getFinancials: () => request("/ceo/financials"),
  getAllUsers: (params?: Record<string, string>) => request(`/ceo/users?${new URLSearchParams(params || {})}`),
  ceoUpdateUser: (id: number, body: any) => request(`/ceo/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  ceoCreateUser: (body: any) => request("/ceo/users", { method: "POST", body: JSON.stringify(body) }),
};
