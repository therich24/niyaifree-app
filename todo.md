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
