/*
  NiYAIFREE Login — Koparion Style + Coral Red
*/
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

export default function Login() {
  useSEO({ title: "เข้าสู่ระบบ", description: "เข้าสู่ระบบ NiYAIFREE อ่านนิยายฟรีครบทุกแนว", noindex: true });

  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [loginStr, setLoginStr] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginStr || !password) { toast.error("กรุณากรอกข้อมูลให้ครบ"); return; }
    setLoading(true);
    const toastId = toast.loading("กำลังเข้าสู่ระบบ...");
    try {
      await login(loginStr, password);
      toast.success("เข้าสู่ระบบสำเร็จ!", { id: toastId });
      setLocation("/");
    } catch (err: any) {
      toast.error(err.message || "เข้าสู่ระบบไม่สำเร็จ", { id: toastId });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-[Kanit] text-slate-900">เข้าสู่ระบบ</h1>
          <p className="text-sm text-slate-500 mt-1">NiYAIFREE — อ่านนิยายฟรี</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5 border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อผู้ใช้ / อีเมล / รหัสสมาชิก / เบอร์โทร</label>
            <input
              type="text" value={loginStr} onChange={e => setLoginStr(e.target.value)}
              placeholder="เช่น admin111, M0000001, email@..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5" disabled={loading}>
            <LogIn className="w-4 h-4 mr-2" /> {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            ยังไม่มีบัญชี? <Link href="/register" className="font-semibold text-primary no-underline hover:underline">สมัครฟรี</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
