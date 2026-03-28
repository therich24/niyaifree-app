/*
  Member Profile — /member/profile
  Edit profile, change password
*/
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { User, Mail, Phone, Lock, Save, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function MemberProfile() {
  const { user, refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({ firstName, lastName, phone });
      await refreshUser();
      toast.success("บันทึกโปรไฟล์สำเร็จ");
    } catch (err: any) {
      toast.error(err.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setChangingPw(true);
    try {
      await api.changePassword({ oldPassword, newPassword });
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setChangingPw(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-8 max-w-2xl">
        <Link href="/member" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6 no-underline">
          <ArrowLeft className="w-4 h-4" /> กลับไปแดชบอร์ด
        </Link>

        <h1 className="text-2xl font-bold font-[Kanit] mb-6">แก้ไขโปรไฟล์</h1>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold font-[Kanit] mb-4">ข้อมูลส่วนตัว</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Member ID</label>
              <input type="text" value={user.memberId} disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล</label>
              <input type="text" value={user.email} disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทร</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0xx-xxx-xxxx" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold font-[Kanit] mb-4">เปลี่ยนรหัสผ่าน</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านปัจจุบัน</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" required />
            </div>
            <button type="submit" disabled={changingPw} className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50">
              <Lock className="w-4 h-4" />
              {changingPw ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
