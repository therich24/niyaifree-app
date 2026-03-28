/*
  NiYAIFREE Register — Koparion Style + Coral Red
*/
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "", firstName: "", lastName: "", phone: "", province: "", referralCode: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { toast.error("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (form.password !== form.confirmPassword) { toast.error("รหัสผ่านไม่ตรงกัน"); return; }
    if (form.password.length < 6) { toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    setLoading(true);
    const toastId = toast.loading("กำลังสมัครสมาชิก...");
    try {
      const memberId = await register(form);
      toast.success(`สมัครสำเร็จ! รหัสสมาชิก: ${memberId}`, { id: toastId, duration: 5000 });
      setLocation("/login");
    } catch (err: any) { toast.error(err.message || "สมัครไม่สำเร็จ", { id: toastId }); }
    setLoading(false);
  };

  const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-[Kanit] text-slate-900">สมัครสมาชิกฟรี</h1>
          <p className="text-sm text-slate-500 mt-1">รับแต้มฟรี 100 แต้ม + อ่านฟรี 7 วัน</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-4 border border-slate-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
              <input type="text" value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="ชื่อ" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
              <input type="text" value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="นามสกุล" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้ <span className="text-red-500">*</span></label>
            <input type="text" value={form.username} onChange={e => set("username", e.target.value)} placeholder="username" className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" className={inputCls} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทร</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="08x-xxx-xxxx" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">จังหวัด</label>
              <input type="text" value={form.province} onChange={e => set("province", e.target.value)} placeholder="จังหวัด" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน <span className="text-red-500">*</span></label>
            <input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่าน <span className="text-red-500">*</span></label>
            <input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="ยืนยันรหัสผ่าน" className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสแนะนำ (ถ้ามี)</label>
            <input type="text" value={form.referralCode} onChange={e => set("referralCode", e.target.value)} placeholder="รหัสแนะนำจากเพื่อน" className={inputCls} />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5" disabled={loading}>
            <UserPlus className="w-4 h-4 mr-2" /> {loading ? "กำลังสมัคร..." : "สมัครสมาชิกฟรี"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            มีบัญชีแล้ว? <Link href="/login" className="font-semibold text-primary no-underline hover:underline">เข้าสู่ระบบ</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
