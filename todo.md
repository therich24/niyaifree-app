# NiYAIFREE Restructure TODO

## Backend API
- [ ] เพิ่ม DB tables: subscriptions, coin_transactions, ebook_downloads
- [ ] เพิ่ม API: CEO login แยก, VIP subscription, Coins purchase/use, eBook download
- [ ] ปรับ users table: เพิ่ม vipUntil, coins fields
- [ ] เพิ่ม copyright warning text ใน settings

## CEO Dashboard (/ceo)
- [ ] สร้างหน้า CEO Login แยก (/ceo)
- [ ] สร้าง CEO Dashboard เต็มรูปแบบ (ดูภาพรวมทั้งระบบ)
- [ ] CEO จัดการ: สมาชิก, Admin, API Keys, การเงิน, ข้อมูลทั้งหมด

## Admin Dashboard (/admin)
- [ ] ปรับ Admin Dashboard เดิม
- [ ] เพิ่ม /admin/ai-factory (สร้างนิยาย AI)
- [ ] เพิ่ม /admin/batch (Batch production)

## Member (/member)
- [ ] ปรับ Member Dashboard (/member)
- [ ] เพิ่ม Profile page (/member/profile)
- [ ] เพิ่ม VIP page (/vip) — ฿100/เดือน, โหลด eBook 10 เล่ม/เดือน, อ่านนิยายยาว 30+ ตอน
- [ ] เพิ่ม Coins page (/coins) — ขั้นต่ำ ฿100, 10 Coin/เล่ม eBook

## Public Pages
- [ ] ปรับ routes: /category/:slug, /novel/:id, /read/:novelId/:chapterId, /search
- [ ] เพิ่มคำเตือนลิขสิทธิ์ พ.ร.บ.ลิขสิทธิ์ 2537 ทุกหน้าอ่าน

## App.tsx Routes
- [ ] ปรับ routes ทั้งหมดตามโครงสร้างใหม่
