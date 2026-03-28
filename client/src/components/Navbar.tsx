/**
 * Design: Koparion Reborn — Forest Green top bar with orange accents
 * Font: Kanit for brand, Sarabun for links
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Menu, X, User, LogOut, Settings, Bookmark, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORIES = [
  "Romance", "CEO", "Mafia", "BL", "Fantasy", "System",
  "เกิดใหม่", "Horror", "ดราม่า", "คอมเมดี้", "ลึกลับ", "ผจญภัย"
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, oklch(0.40 0.12 155), oklch(0.72 0.16 60), oklch(0.40 0.12 155))" }} />

      <nav className="bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.40 0.12 155)" }}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "Kanit", color: "oklch(0.40 0.12 155)" }}>
                NiYAI<span style={{ color: "oklch(0.72 0.16 60)" }}>FREE</span>
              </span>
              <p className="text-[10px] text-muted-foreground -mt-1" style={{ fontFamily: "Sarabun" }}>อ่านนิยายฟรี ครบทุกแนว</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/" className={`px-3 py-2 text-sm font-medium rounded-md transition-colors no-underline ${location === "/" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}>
              หน้าแรก
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-foreground hover:bg-muted flex items-center gap-1">
                  หมวดหมู่ <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 grid grid-cols-2 gap-0 p-2">
                {CATEGORIES.map(cat => (
                  <DropdownMenuItem key={cat} asChild>
                    <Link href={`/genre/${encodeURIComponent(cat)}`} className="no-underline text-sm">
                      {cat}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/genre/popular" className="px-3 py-2 text-sm font-medium rounded-md transition-colors no-underline text-foreground hover:bg-muted">
              มาแรง
            </Link>
            <Link href="/genre/newest" className="px-3 py-2 text-sm font-medium rounded-md transition-colors no-underline text-foreground hover:bg-muted">
              ล่าสุด
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-md hover:bg-muted transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "oklch(0.40 0.12 155)" }}>
                      {user.firstName?.[0] || user.username[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user.username}</span>
                    <span className="hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "oklch(0.72 0.16 60 / 0.15)", color: "oklch(0.55 0.16 60)" }}>
                      {user.points} แต้ม
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.memberId} · {user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="no-underline"><User className="w-4 h-4 mr-2" /> แดชบอร์ด</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks" className="no-underline"><Bookmark className="w-4 h-4 mr-2" /> ที่คั่นหนังสือ</Link>
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.role === "ceo") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="no-underline"><Settings className="w-4 h-4 mr-2" /> จัดการระบบ</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-sm">เข้าสู่ระบบ</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-sm text-white" style={{ background: "oklch(0.72 0.16 60)" }}>สมัครฟรี</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-md hover:bg-muted">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t px-4 py-3 bg-white">
            <form onSubmit={handleSearch} className="container flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหานิยาย ชื่อเรื่อง หมวดหมู่..."
                className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              <Button type="submit" size="sm" className="text-white" style={{ background: "oklch(0.40 0.12 155)" }}>
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-white px-4 py-4 space-y-2">
            <Link href="/" className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted no-underline" onClick={() => setMobileOpen(false)}>หน้าแรก</Link>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3">หมวดหมู่</p>
            <div className="grid grid-cols-3 gap-1">
              {CATEGORIES.map(cat => (
                <Link key={cat} href={`/genre/${encodeURIComponent(cat)}`} className="px-3 py-2 rounded-md text-sm hover:bg-muted no-underline text-center" onClick={() => setMobileOpen(false)}>
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
