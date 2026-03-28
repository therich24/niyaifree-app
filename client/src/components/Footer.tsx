/**
 * Design: Koparion Reborn — Dark green footer with warm accents
 */
import { Link } from "wouter";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="text-white mt-16" style={{ background: "oklch(0.22 0.06 155)" }}>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.72 0.16 60)" }}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: "Kanit" }}>
                NiYAI<span style={{ color: "oklch(0.72 0.16 60)" }}>FREE</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              อ่านนิยายฟรี ครบทุกแนว อัปเดตทุกวัน<br />
              Romance, Fantasy, BL, Horror และอีกมากมาย
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: "Kanit", color: "oklch(0.72 0.16 60)" }}>เมนูหลัก</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/" className="hover:text-white transition-colors no-underline text-white/70">หน้าแรก</Link></li>
              <li><Link href="/genre/popular" className="hover:text-white transition-colors no-underline text-white/70">นิยายมาแรง</Link></li>
              <li><Link href="/genre/newest" className="hover:text-white transition-colors no-underline text-white/70">อัปเดตล่าสุด</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors no-underline text-white/70">สมัครสมาชิก</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: "Kanit", color: "oklch(0.72 0.16 60)" }}>หมวดหมู่ยอดนิยม</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/genre/Romance" className="hover:text-white transition-colors no-underline text-white/70">Romance</Link></li>
              <li><Link href="/genre/Fantasy" className="hover:text-white transition-colors no-underline text-white/70">Fantasy</Link></li>
              <li><Link href="/genre/BL" className="hover:text-white transition-colors no-underline text-white/70">BL</Link></li>
              <li><Link href="/genre/Horror" className="hover:text-white transition-colors no-underline text-white/70">Horror</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4" style={{ fontFamily: "Kanit", color: "oklch(0.72 0.16 60)" }}>เกี่ยวกับเรา</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/about" className="hover:text-white transition-colors no-underline text-white/70">เกี่ยวกับ NiYAIFREE</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors no-underline text-white/70">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors no-underline text-white/70">เงื่อนไขการใช้งาน</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors no-underline text-white/70">ติดต่อเรา</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/50">
          <p>&copy; 2026 NiYAIFREE — iDea Memory Group. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Powered by AI — อ่านฟรี ไม่มีค่าใช้จ่าย</p>
        </div>
      </div>
    </footer>
  );
}
