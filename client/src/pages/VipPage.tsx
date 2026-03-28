/*
  VIP Page — /vip
  VIP subscription plans and benefits
*/
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { toast } from "sonner";
import { Crown, BookOpen, Download, Shield, Star, Check, ChevronRight, Zap } from "lucide-react";

export default function VipPage() {
  const { user } = useAuth();
  const isVip = user?.vipUntil && new Date(user.vipUntil) > new Date();

  function handleSubscribe() {
    if (!user) {
      toast.warning("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    toast.info("ระบบชำระเงินกำลังพัฒนา กรุณาติดต่อ Admin");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50 py-20">
        <div className="container text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-[Kanit] text-slate-900 mb-4">
            สมัคร <span className="text-amber-600">VIP</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            ปลดล็อกประสบการณ์อ่านนิยายเต็มรูปแบบ อ่านได้ทุกเรื่อง โหลด eBook ได้
          </p>
          {isVip && (
            <div className="mt-6 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-6 py-3 rounded-full font-bold">
              <Crown className="w-5 h-5" />
              คุณเป็นสมาชิก VIP อยู่แล้ว (ถึง {new Date(user!.vipUntil!).toLocaleDateString("th-TH")})
            </div>
          )}
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold font-[Kanit] text-lg mb-2">FREE</h3>
              <p className="text-4xl font-bold text-slate-900 mb-1">฿0</p>
              <p className="text-sm text-slate-500 mb-6">ฟรีตลอดชีพ</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" /> อ่านนิยายฟรี (ไม่เกิน 30 ตอน)
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" /> ค้นหาและบันทึกที่คั่น
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Shield className="w-4 h-4" /> มีโฆษณา
                </li>
              </ul>
              <Link href="/register" className="block text-center py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors no-underline">
                สมัครฟรี
              </Link>
            </div>

            {/* VIP */}
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-6 border-2 border-amber-400 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                แนะนำ
              </div>
              <h3 className="font-bold font-[Kanit] text-lg mb-2 text-amber-800">VIP</h3>
              <p className="text-4xl font-bold text-amber-700 mb-1">฿100</p>
              <p className="text-sm text-amber-600 mb-6">ต่อเดือน</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-amber-500" /> อ่านนิยายยาวเกิน 30 ตอนได้ทุกเรื่อง
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-amber-500" /> โหลด eBook ได้ 10 เล่ม/เดือน
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-amber-500" /> ไม่มีโฆษณา
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-amber-500" /> สนับสนุนนักเขียน
                </li>
              </ul>
              <button
                onClick={handleSubscribe}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
              >
                สมัคร VIP เลย
              </button>
            </div>

            {/* Coins */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold font-[Kanit] text-lg mb-2 text-emerald-700">Coins</h3>
              <p className="text-4xl font-bold text-emerald-700 mb-1">฿100</p>
              <p className="text-sm text-emerald-600 mb-6">ขั้นต่ำ (100 Coins)</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" /> โหลด eBook — 10 Coins/เล่ม
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" /> ซื้อเมื่อต้องการ ไม่ต้องสมัครรายเดือน
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500" /> Coins ไม่มีวันหมดอายุ
                </li>
              </ul>
              <Link href="/coins" className="block text-center py-3 border border-emerald-400 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors no-underline">
                ซื้อ Coins
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright Warning */}
      <section className="py-8 bg-red-50/50">
        <div className="container">
          <div className="flex items-start gap-3 max-w-3xl mx-auto">
            <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">
              <strong>คำเตือนเรื่องลิขสิทธิ์:</strong> ห้ามกอปปี้ คัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ จำหน่าย โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท
              ตามกฎหมายลิขสิทธิ์ไทย พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
