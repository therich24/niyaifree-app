/*
  NiYAIFREE Footer — Koparion Book Shop Style + Coral Red
  Dark bg, 4-column layout, copyright warning
*/
import { Link } from "wouter";
import { BookOpen, Mail, Phone, MapPin, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-[Kanit]">
                NiYAI<span className="text-primary">FREE</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              แพลตฟอร์มอ่านนิยายออนไลน์ฟรี
              คลังนิยายหลากหลายแนว อัปเดตทุกวัน
              อ่านฟรีไม่มีค่าใช้จ่าย
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold font-[Kanit] text-lg mb-4">ลิงก์ด่วน</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "หน้าหลัก" },
                { href: "/search", label: "ค้นหานิยาย" },
                { href: "/genre/แฟนตาซี", label: "แฟนตาซี" },
                { href: "/genre/โรแมนติก", label: "โรแมนติก" },
                { href: "/vip", label: "สมัคร VIP" },
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
            <h4 className="font-bold font-[Kanit] text-lg mb-4">หมวดหมู่</h4>
            <ul className="space-y-2.5">
              {["แอ็คชั่น", "ดราม่า", "สยองขวัญ", "ลึกลับ", "Sci-Fi"].map(cat => (
                <li key={cat}>
                  <Link href={`/genre/${cat}`} className="text-slate-400 hover:text-primary transition-colors text-sm no-underline">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold font-[Kanit] text-lg mb-4">ติดต่อเรา</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                contact@niyaifree.com
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                02-xxx-xxxx
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                กรุงเทพมหานคร ประเทศไทย
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Warning */}
      <div className="border-t border-slate-800">
        <div className="container py-4">
          <div className="flex items-start gap-2 mb-3">
            <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">
              <strong>คำเตือนเรื่องลิขสิทธิ์:</strong> ห้ามกอปปี้ คัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ จำหน่าย โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท
              ตามกฎหมายลิขสิทธิ์ไทย พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537 ผู้ฝ่าฝืนมีโทษจำคุกไม่เกิน 4 ปี หรือปรับไม่เกิน 800,000 บาท หรือทั้งจำทั้งปรับ
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} NiYAIFREE — iDea Memory Group. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-primary no-underline text-slate-500">นโยบายความเป็นส่วนตัว</Link>
              <Link href="/terms" className="hover:text-primary no-underline text-slate-500">ข้อกำหนดการใช้งาน</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
