/*
  NiYAIFREE Footer — Bookworm Bookstore Style
  4-column responsive grid, newsletter, copyright
*/
import { Link } from "wouter";
import { BookOpen, Mail, Phone, MapPin, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer>
      {/* Newsletter Section */}
      <div className="bg-slate-900 py-12">
        <div className="container text-center">
          <h3 className="text-xl font-bold text-white mb-2">รับข่าวสารนิยายใหม่</h3>
          <p className="text-slate-400 text-sm mb-5">สมัครรับจดหมายข่าวเพื่อรับข้อเสนอพิเศษและนิยายใหม่ก่อนใคร</p>
          <div className="flex items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-l-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary"
            />
            <button className="bg-primary text-white px-6 py-3 rounded-r-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
              สมัครรับข่าว
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-slate-950 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold font-[Kanit] text-white">
                  NiYAI<span className="text-primary">FREE</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                แพลตฟอร์มอ่านนิยายออนไลน์ฟรี คลังนิยายหลากหลายแนว อัปเดตทุกวัน
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  contact@niyaifree.com
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  02-xxx-xxxx
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  กรุงเทพมหานคร
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold font-[Kanit] text-white text-sm mb-4">ลิงก์ด่วน</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/", label: "หน้าหลัก" },
                  { href: "/search", label: "ค้นหานิยาย" },
                  { href: "/vip", label: "สมัคร VIP" },
                  { href: "/coins", label: "ซื้อ Coins" },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-400 hover:text-primary transition-colors text-sm no-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold font-[Kanit] text-white text-sm mb-4">หมวดหมู่</h4>
              <ul className="space-y-2.5">
                {["แฟนตาซี", "โรแมนติก", "แอ็คชั่น", "ดราม่า", "สยองขวัญ", "ลึกลับ"].map(cat => (
                  <li key={cat}>
                    <Link href={`/genre/${cat}`} className="text-slate-400 hover:text-primary transition-colors text-sm no-underline">
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policy */}
            <div>
              <h4 className="font-bold font-[Kanit] text-white text-sm mb-4">นโยบาย</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/terms", label: "ข้อกำหนดการใช้งาน" },
                  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
                  { href: "/refund", label: "นโยบายคืนเงิน" },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-400 hover:text-primary transition-colors text-sm no-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-slate-950 border-t border-slate-800">
        <div className="container py-5">
          <div className="flex items-start gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-400">คำเตือนเรื่องลิขสิทธิ์:</strong> ห้ามกอปปี้ คัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ จำหน่าย โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท
              ตามกฎหมายลิขสิทธิ์ไทย พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <p>&copy; {new Date().getFullYear()} NiYAIFREE — iDea Memory Group. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-primary no-underline text-slate-600">นโยบายความเป็นส่วนตัว</Link>
              <Link href="/terms" className="hover:text-primary no-underline text-slate-600">ข้อกำหนดการใช้งาน</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
