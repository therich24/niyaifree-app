/*
  Coins Page — /coins — Coral Red Theme
*/
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Coins, Download, Shield, Check, ChevronRight } from "lucide-react";

const COIN_PACKAGES = [
  { coins: 100, price: 100, label: "100 Coins", popular: false },
  { coins: 300, price: 250, label: "300 Coins", popular: true, save: "ประหยัด ฿50" },
  { coins: 500, price: 400, label: "500 Coins", popular: false, save: "ประหยัด ฿100" },
  { coins: 1000, price: 750, label: "1,000 Coins", popular: false, save: "ประหยัด ฿250" },
];

export default function CoinsPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(1);

  function handleBuy() {
    if (!user) {
      toast.warning("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    toast.info("ระบบชำระเงินกำลังพัฒนา กรุณาติดต่อ Admin");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50 py-16">
        <div className="container text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-[Kanit] text-slate-900 mb-3">
            ซื้อ <span className="text-amber-600">Coins</span>
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Coins ใช้สำหรับโหลด eBook เป็นรูปเล่ม (10 Coins ต่อ 1 เล่ม) ซื้อขั้นต่ำ ฿100
          </p>
          {user && (
            <p className="mt-4 text-lg font-semibold text-amber-700">
              Coins ปัจจุบัน: <span className="text-2xl">{user.coins || 0}</span> Coins
            </p>
          )}
        </div>
      </section>

      {/* Packages */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COIN_PACKAGES.map((pkg, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`relative p-6 rounded-2xl border-2 text-left transition-all ${
                  selected === i
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-slate-200 bg-white hover:border-primary/30"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    ยอดนิยม
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{pkg.label}</p>
                    {pkg.save && <p className="text-xs text-primary font-semibold mt-1">{pkg.save}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-600">฿{pkg.price}</p>
                    <p className="text-xs text-slate-500">฿{(pkg.price / pkg.coins).toFixed(2)}/coin</p>
                  </div>
                </div>
                {selected === i && (
                  <div className="absolute top-4 left-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleBuy}
              className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg"
            >
              ซื้อ {COIN_PACKAGES[selected].label} — ฿{COIN_PACKAGES[selected].price}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Info */}
          <div className="mt-12 bg-slate-50 rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold font-[Kanit] mb-3">Coins ใช้ทำอะไรได้?</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                โหลด eBook เป็นรูปเล่ม — 10 Coins ต่อ 1 เล่ม
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Coins ไม่มีวันหมดอายุ ใช้ได้ตลอด
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                ซื้อเมื่อต้องการ ไม่ต้องสมัครรายเดือน
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <section className="py-6 bg-red-50/50">
        <div className="container">
          <div className="flex items-start gap-2 max-w-3xl mx-auto">
            <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">
              <strong>คำเตือนเรื่องลิขสิทธิ์:</strong> ห้ามกอปปี้ คัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ จำหน่าย โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท
              ตามกฎหมายลิขสิทธิ์ไทย พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
