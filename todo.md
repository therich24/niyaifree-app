# eBook PDF Download Feature TODO

## Backend
- [ ] Install pdfkit or use built-in PDF generation
- [ ] Create API route: GET /api/ebook/download/:novelId
- [ ] Check VIP status (free 10/month) or deduct 10 Coins
- [ ] Track downloads in ebook_downloads table
- [ ] Generate PDF with novel title, chapters, copyright notice
- [ ] Add API route: GET /api/ebook/my-downloads (download history)

## Frontend
- [ ] Add download button on NovelDetail page (VIP/Coins)
- [ ] Show download modal with VIP/Coins option
- [ ] Add eBook Library page (/member/ebooks) for download history
- [ ] Add download count on MemberDashboard

## PDF Format
- [ ] Cover page with novel title + author
- [ ] Table of contents
- [ ] Each chapter on new section
- [ ] Copyright warning footer on every page
- [ ] Thai font support (Sarabun)

# New Tasks (2026-03-29)

## Phase 1: กราฟแท่งรายชั่วโมง
- [ ] แก้ backend /api/analytics/dashboard ให้ส่ง hourly data
- [ ] แก้ Analytics.tsx ให้แสดงกราฟแท่งรายชั่วโมง (bar chart)

## Phase 2: ระบบนิยายแนะนำ (Featured)
- [ ] เพิ่ม toggle isFeatured ใน Admin Panel
- [ ] แสดง Featured novels บนหน้าแรก

## Phase 3: ค้นหาขั้นสูง
- [ ] เพิ่ม filter หมวดหมู่, สถานะ, จำนวนตอน, Age Rating ในหน้า Search

## Phase 4: สร้างปกนิยาย
- [ ] อ่าน Cover Skill
- [ ] สร้างปกด้วย Banana Pro สำหรับนิยายที่ยังไม่มีปก

## Phase 5: แต่งนิยายให้จบ
- [ ] ตรวจสอบนิยายที่ยังไม่จบ
- [ ] ใช้ Gemini API แต่งนิยายให้ครบ
