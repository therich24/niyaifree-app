/*
  NiYAIFREE Navbar — Bookworm Bookstore Style
  Top utility bar + main nav with logo, links, search, user icons
*/
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search, User, BookOpen, Menu, X, ChevronDown, Crown,
  Settings, LogOut, LayoutDashboard, Bookmark, Coins, Heart, Phone, HelpCircle, Sparkles, BarChart3
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) { toast.warning("กรุณาพิมพ์คำค้นหา"); return; }
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setMobileOpen(false);
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  }

  const navLinks = [
    { href: "/", label: "หน้าหลัก" },
    { href: "/search", label: "หมวดหมู่" },
    { href: "/genre/แฟนตาซี", label: "แฟนตาซี" },
    { href: "/genre/โรแมนติก", label: "โรแมนติก" },
    { href: "/genre/แอ็คชั่น", label: "แอ็คชั่น" },
    { href: "/vip", label: "VIP", special: true },
    { href: "/analytics", label: "สถิติ" },
  ];

  return (
    <>
      {/* Utility Top Bar */}
      <div className="hidden md:block bg-slate-50 border-b border-slate-100">
        <div className="container">
          <div className="flex items-center justify-between h-9 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                ช่วยเหลือ
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                02-xxx-xxxx
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>อ่านนิยายฟรี ไม่มีค่าใช้จ่าย</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container">
          <div className="flex items-center h-16 gap-4 lg:gap-8">
            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 text-slate-700 hover:text-primary">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold font-[Kanit] text-slate-900">
                NiYAI<span className="text-primary">FREE</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors no-underline whitespace-nowrap ${
                    link.special
                      ? "text-primary font-bold"
                      : location === link.href
                        ? "text-primary"
                        : "text-slate-700 hover:text-primary"
                  }`}
                >
                  {link.special && <Crown className="w-3.5 h-3.5 inline mr-1" />}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-slate-50 rounded-lg border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <button type="submit" className="pl-3 pr-1 py-2 text-slate-400 hover:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหานิยาย..."
                className="bg-transparent px-2 py-2 text-sm outline-none w-36 lg:w-48"
              />
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              {user && (
                <Link href="/member" className="hidden sm:flex p-2 text-slate-500 hover:text-primary transition-colors no-underline">
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-slate-600" />
                    <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.username}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900">{user.firstName || user.username}</p>
                          <p className="text-xs text-slate-500">{user.memberId}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{user.points || 0} แต้ม</span>
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{user.coins || 0} Coins</span>
                          </div>
                        </div>
                        <div className="py-1">
                          <Link href="/member" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 no-underline" onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard className="w-4 h-4 text-slate-400" /> แดชบอร์ด
                          </Link>
                          <Link href="/member/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 no-underline" onClick={() => setUserMenuOpen(false)}>
                            <User className="w-4 h-4 text-slate-400" /> โปรไฟล์
                          </Link>
                          <Link href="/member" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 no-underline" onClick={() => setUserMenuOpen(false)}>
                            <Bookmark className="w-4 h-4 text-slate-400" /> ที่คั่นหนังสือ
                          </Link>
                          <Link href="/coins" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 no-underline" onClick={() => setUserMenuOpen(false)}>
                            <Coins className="w-4 h-4 text-slate-400" /> ซื้อ Coins
                          </Link>
                          {(user.role === "admin" || user.role === "ceo") && (
                            <>
                              <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 no-underline" onClick={() => setUserMenuOpen(false)}>
                                <Settings className="w-4 h-4 text-slate-400" /> จัดการระบบ
                              </Link>
                              <Link href="/analytics" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 no-underline" onClick={() => setUserMenuOpen(false)}>
                                <BarChart3 className="w-4 h-4 text-blue-400" /> สถิติการเข้าชม
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="border-t border-slate-100 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                            <LogOut className="w-4 h-4" /> ออกจากระบบ
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-primary transition-colors no-underline px-3 py-2">
                    เข้าสู่ระบบ
                  </Link>
                  <Link href="/register" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors no-underline whitespace-nowrap">
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-slate-100 py-4 space-y-1">
              <form onSubmit={handleSearch} className="flex items-center bg-slate-50 rounded-lg border border-slate-200 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหานิยาย..."
                  className="bg-transparent px-3 py-2.5 text-sm outline-none flex-1"
                />
                <button type="submit" className="px-3 py-2.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium no-underline ${
                    location === link.href ? "text-primary bg-primary/5" : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Promo Banner */}
      <div className="promo-banner py-2 text-center text-sm font-medium">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <Sparkles className="w-4 h-4" />
          สมัครสมาชิกวันนี้ อ่านฟรี 7 วัน + รับแต้ม 100 แต้ม!
          <Link href="/register" className="underline font-bold text-primary ml-1 hover:opacity-80 no-underline">
            สมัครเลย →
          </Link>
        </span>
      </div>
    </>
  );
}

