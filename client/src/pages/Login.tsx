/**
 * Design: Koparion Reborn — Login page with green/orange accents
 * Login with: username, email, memberId, or phone
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [loginStr, setLoginStr] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginStr || !password) { toast.error("กรุณากรอกข้อมูลให้ครบ"); return; }
    setLoading(true);
    try {
      await login(loginStr, password);
      toast.success("เข้าสู่ระบบสำเร็จ");
      setLocation("/");
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: "oklch(0.97 0.005 155)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(0.40 0.12 155)" }}>
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "Kanit", color: "oklch(0.25 0.06 155)" }}>เข้าสู่ระบบ</h1>
          <p className="text-sm text-muted-foreground mt-1">NiYAIFREE — อ่านนิยายฟรี</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5 border">
          <div>
            <label className="block text-sm font-medium mb-1.5">ชื่อผู้ใช้ / อีเมล / รหัสสมาชิก / เบอร์โทร</label>
            <input
              type="text" value={loginStr} onChange={e => setLoginStr(e.target.value)}
              placeholder="เช่น admin111, M0000001, email@..."
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">รหัสผ่าน</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Button type="submit" className="w-full text-white font-semibold py-2.5" style={{ background: "oklch(0.40 0.12 155)" }} disabled={loading}>
            <LogIn className="w-4 h-4 mr-2" /> {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี? <Link href="/register" className="font-semibold no-underline" style={{ color: "oklch(0.72 0.16 60)" }}>สมัครฟรี</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
