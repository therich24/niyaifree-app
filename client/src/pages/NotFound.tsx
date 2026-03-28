import { BookOpen, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-primary font-[Kanit] mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-900 font-[Kanit] mb-3">ไม่พบหน้าที่ต้องการ</h2>
        <p className="text-slate-500 mb-8">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </button>
          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" /> หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
