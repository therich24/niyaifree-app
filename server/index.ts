import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "niyaifree-secret-key-2026");

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" }));

  // ============ AUTH HELPERS ============
  async function createToken(user: any) {
    return new SignJWT({ id: user.id, role: user.role, memberId: user.memberId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
  }

  async function verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as any;
    } catch { return null; }
  }

  function authMiddleware(roles?: string[]) {
    return async (req: any, res: any, next: any) => {
      const auth = req.headers.authorization;
      if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
      const payload = await verifyToken(auth.slice(7));
      if (!payload) return res.status(401).json({ error: "Invalid token" });
      if (roles && !roles.includes(payload.role)) return res.status(403).json({ error: "Forbidden" });
      req.user = payload;
      next();
    };
  }

  // ============ AUTH ROUTES ============
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, phone, province, referralCode } = req.body;
      const hash = bcrypt.hashSync(password, 10);
      const [countResult]: any = await pool.execute("SELECT COUNT(*) as c FROM users");
      const nextNum = countResult[0].c + 1;
      const memberId = `M${String(nextNum).padStart(7, "0")}`;
      const myReferral = `REF${Date.now().toString(36).toUpperCase()}`;
      const [settings]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='points_signup'");
      const signupPoints = parseInt(settings[0]?.settingValue || "100");
      const [freeDays]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='free_read_days'");
      const freeReadDays = parseInt(freeDays[0]?.settingValue || "7");
      const freeUntil = new Date(Date.now() + freeReadDays * 86400000).toISOString().slice(0, 19).replace("T", " ");

      await pool.execute(
        `INSERT INTO users (memberId, username, email, passwordHash, firstName, lastName, phone, province, points, freeReadUntil, referralCode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [memberId, username, email, hash, firstName || "", lastName || "", phone || "", province || "", signupPoints, freeUntil, myReferral]
      );

      // Handle referral
      if (referralCode) {
        const [referrer]: any = await pool.execute("SELECT id FROM users WHERE referralCode=?", [referralCode]);
        if (referrer.length > 0) {
          const [refSettings]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='points_referral'");
          const refPoints = parseInt(refSettings[0]?.settingValue || "100");
          await pool.execute("UPDATE users SET points = points + ? WHERE id = ?", [refPoints, referrer[0].id]);
          await pool.execute("INSERT INTO point_transactions (userId, amount, type, description) VALUES (?, ?, 'referral', ?)", [referrer[0].id, refPoints, `แนะนำสมาชิก ${username}`]);
        }
      }

      // Log signup points
      const [newUser]: any = await pool.execute("SELECT id FROM users WHERE username=?", [username]);
      await pool.execute("INSERT INTO point_transactions (userId, amount, type, description) VALUES (?, ?, 'signup', 'แต้มสมัครสมาชิกใหม่')", [newUser[0].id, signupPoints]);

      res.json({ success: true, memberId });
    } catch (e: any) {
      if (e.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "ชื่อผู้ใช้หรืออีเมลซ้ำ" });
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { login, password } = req.body;
      const [rows]: any = await pool.execute(
        "SELECT * FROM users WHERE username=? OR email=? OR memberId=? OR phone=?",
        [login, login, login.toUpperCase(), login]
      );
      if (rows.length === 0) return res.status(401).json({ error: "ไม่พบบัญชี" });
      const user = rows[0];
      if (!user.isActive) return res.status(403).json({ error: "บัญชีถูกระงับ" });
      if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
      await pool.execute("UPDATE users SET lastLoginAt=NOW() WHERE id=?", [user.id]);
      const token = await createToken(user);
      res.json({ success: true, token, user: { id: user.id, memberId: user.memberId, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, points: user.points, freeReadUntil: user.freeReadUntil, referralCode: user.referralCode } });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/auth/me", authMiddleware(), async (req: any, res) => {
    const [rows]: any = await pool.execute("SELECT id, memberId, username, email, firstName, lastName, phone, province, role, points, freeReadUntil, referralCode, createdAt FROM users WHERE id=?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  });

  // ============ NOVEL ROUTES (PUBLIC) ============
  app.get("/api/novels", async (req, res) => {
    try {
      const { category, status, featured, search, sort, limit: lim, offset: off } = req.query;
      let sql = "SELECT id, title, slug, author, category, description, coverUrl, ageRating, status, totalChapters, totalWords, viewCount, likeCount, isFeatured, createdAt FROM novels WHERE 1=1";
      const params: any[] = [];
      if (category) { sql += " AND category=?"; params.push(category); }
      if (status) { sql += " AND status=?"; params.push(status); }
      if (featured === "true") { sql += " AND isFeatured=1"; }
      if (search) { sql += " AND (title LIKE ? OR description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
      const sortMap: any = { newest: "createdAt DESC", popular: "viewCount DESC", updated: "updatedAt DESC" };
      sql += ` ORDER BY ${sortMap[sort as string] || "updatedAt DESC"}`;
      const limitNum = parseInt(lim as string) || 20;
      const offsetNum = parseInt(off as string) || 0;
      sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
      const [rows] = await pool.execute(sql, params);
      const [countResult]: any = await pool.execute("SELECT COUNT(*) as total FROM novels" + (category ? " WHERE category=?" : ""), category ? [category as string] : []);
      res.json({ novels: rows, total: countResult[0].total });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/novels/:slug", async (req, res) => {
    try {
      const [rows]: any = await pool.execute("SELECT * FROM novels WHERE slug=?", [req.params.slug]);
      if (rows.length === 0) return res.status(404).json({ error: "Not found" });
      await pool.execute("UPDATE novels SET viewCount = viewCount + 1 WHERE id=?", [rows[0].id]);
      const [chapters]: any = await pool.execute("SELECT id, chapterNumber, title, wordCount, viewCount, createdAt FROM chapters WHERE novelId=? ORDER BY chapterNumber", [rows[0].id]);
      res.json({ ...rows[0], chapters });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/chapters/:novelId/:chapterNumber", async (req, res) => {
    try {
      const [rows]: any = await pool.execute("SELECT * FROM chapters WHERE novelId=? AND chapterNumber=?", [req.params.novelId, req.params.chapterNumber]);
      if (rows.length === 0) return res.status(404).json({ error: "Not found" });
      await pool.execute("UPDATE chapters SET viewCount = viewCount + 1 WHERE id=?", [rows[0].id]);
      const [total]: any = await pool.execute("SELECT COUNT(*) as c FROM chapters WHERE novelId=?", [req.params.novelId]);
      res.json({ ...rows[0], totalChapters: total[0].c });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/categories", async (_req, res) => {
    try {
      const [rows] = await pool.execute("SELECT category, COUNT(*) as count FROM novels GROUP BY category ORDER BY count DESC");
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ MEMBER ROUTES ============
  app.post("/api/member/bookmark", authMiddleware(), async (req: any, res) => {
    try {
      const { novelId, chapterId, chapterNumber } = req.body;
      await pool.execute(
        "INSERT INTO bookmarks (userId, novelId, chapterId, chapterNumber) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE chapterId=VALUES(chapterId), chapterNumber=VALUES(chapterNumber)",
        [req.user.id, novelId, chapterId || null, chapterNumber || 1]
      );
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/member/bookmarks", authMiddleware(), async (req: any, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT b.*, n.title, n.slug, n.coverUrl, n.totalChapters, n.category
         FROM bookmarks b JOIN novels n ON b.novelId = n.id WHERE b.userId=? ORDER BY b.createdAt DESC`,
        [req.user.id]
      );
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/member/read-log", authMiddleware(), async (req: any, res) => {
    try {
      const { novelId, chapterId, chapterNumber, duration, progress } = req.body;
      await pool.execute(
        "INSERT INTO read_logs (userId, novelId, chapterId, chapterNumber, duration, progress) VALUES (?, ?, ?, ?, ?, ?)",
        [req.user.id, novelId, chapterId, chapterNumber || 0, duration || 0, progress || 0]
      );
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/member/reading-history", authMiddleware(), async (req: any, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT rl.novelId, n.title, n.slug, n.coverUrl, n.category, n.totalChapters,
                MAX(rl.chapterNumber) as lastChapter, MAX(rl.progress) as maxProgress, MAX(rl.createdAt) as lastRead
         FROM read_logs rl JOIN novels n ON rl.novelId = n.id
         WHERE rl.userId=? GROUP BY rl.novelId ORDER BY lastRead DESC LIMIT 20`,
        [req.user.id]
      );
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/member/use-points", authMiddleware(), async (req: any, res) => {
    try {
      const { novelId, chapterId, chapterNumber } = req.body;
      const [user]: any = await pool.execute("SELECT points, freeReadUntil FROM users WHERE id=?", [req.user.id]);
      if (user[0].freeReadUntil && new Date(user[0].freeReadUntil) > new Date()) {
        return res.json({ success: true, free: true, pointsRemaining: user[0].points });
      }
      const [settings]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='points_per_chapter'");
      const cost = parseInt(settings[0]?.settingValue || "3");
      if (user[0].points < cost) return res.status(400).json({ error: "แต้มไม่พอ", pointsNeeded: cost, pointsHave: user[0].points });
      await pool.execute("UPDATE users SET points = points - ? WHERE id=?", [cost, req.user.id]);
      await pool.execute("INSERT INTO point_transactions (userId, amount, type, description) VALUES (?, ?, 'read_chapter', ?)", [req.user.id, -cost, `อ่านตอนที่ ${chapterNumber}`]);
      res.json({ success: true, pointsUsed: cost, pointsRemaining: user[0].points - cost });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/member/earn-points", authMiddleware(), async (req: any, res) => {
    try {
      const { type } = req.body;
      const typeMap: any = { share: "points_share", watch_ad: "points_watch_ad" };
      const settingKey = typeMap[type];
      if (!settingKey) return res.status(400).json({ error: "Invalid type" });
      const [settings]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey=?", [settingKey]);
      const amount = parseInt(settings[0]?.settingValue || "10");
      await pool.execute("UPDATE users SET points = points + ? WHERE id=?", [amount, req.user.id]);
      await pool.execute("INSERT INTO point_transactions (userId, amount, type, description) VALUES (?, ?, ?, ?)", [req.user.id, amount, type, `ได้รับแต้มจาก ${type}`]);
      const [user]: any = await pool.execute("SELECT points FROM users WHERE id=?", [req.user.id]);
      res.json({ success: true, pointsEarned: amount, pointsTotal: user[0].points });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ ADMIN ROUTES ============
  app.get("/api/admin/stats", authMiddleware(["admin", "ceo"]), async (_req, res) => {
    try {
      const [users]: any = await pool.execute("SELECT COUNT(*) as c FROM users");
      const [novels]: any = await pool.execute("SELECT COUNT(*) as c FROM novels");
      const [chapters]: any = await pool.execute("SELECT COUNT(*) as c FROM chapters");
      const [views]: any = await pool.execute("SELECT SUM(viewCount) as c FROM novels");
      const [recentUsers]: any = await pool.execute("SELECT COUNT(*) as c FROM users WHERE createdAt > DATE_SUB(NOW(), INTERVAL 7 DAY)");
      const [topNovels]: any = await pool.execute("SELECT id, title, viewCount, likeCount FROM novels ORDER BY viewCount DESC LIMIT 10");
      const [categoryStats]: any = await pool.execute("SELECT category, COUNT(*) as count, SUM(viewCount) as views FROM novels GROUP BY category ORDER BY views DESC");
      res.json({ totalUsers: users[0].c, totalNovels: novels[0].c, totalChapters: chapters[0].c, totalViews: views[0].c || 0, recentUsers: recentUsers[0].c, topNovels, categoryStats });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Admin: Manage novels
  app.post("/api/admin/novels", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const { title, category, description, coverUrl, ageRating, author, status } = req.body;
      const slug = title.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/(^-|-$)/g, "");
      const seoTitle = `${title} อ่านฟรี จบครบทุกตอน | NiYAIFREE`;
      const seoDesc = `อ่าน ${title} ฟรี สนุก ครบทุกตอน อัปเดตล่าสุด`;
      const [result]: any = await pool.execute(
        "INSERT INTO novels (title, slug, author, category, description, coverUrl, ageRating, status, seoTitle, seoDescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [title, slug, author || "NiYAIFREE", category, description || "", coverUrl || "", ageRating || "ทั่วไป", status || "draft", seoTitle, seoDesc]
      );
      res.json({ success: true, id: result.insertId });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/admin/novels/:id", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const fields = req.body;
      const allowed = ["title", "category", "description", "coverUrl", "ageRating", "author", "status", "isFeatured"];
      const sets: string[] = [];
      const vals: any[] = [];
      for (const k of allowed) {
        if (fields[k] !== undefined) { sets.push(`${k}=?`); vals.push(fields[k]); }
      }
      if (sets.length === 0) return res.status(400).json({ error: "No fields" });
      vals.push(req.params.id);
      await pool.execute(`UPDATE novels SET ${sets.join(",")} WHERE id=?`, vals);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/admin/novels/:id", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      await pool.execute("DELETE FROM novels WHERE id=?", [req.params.id]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Admin: Manage chapters
  app.post("/api/admin/chapters", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const { novelId, chapterNumber, title, content } = req.body;
      const wordCount = content.replace(/\s+/g, "").length;
      await pool.execute(
        "INSERT INTO chapters (novelId, chapterNumber, title, content, wordCount) VALUES (?, ?, ?, ?, ?)",
        [novelId, chapterNumber, title, content, wordCount]
      );
      await pool.execute("UPDATE novels SET totalChapters = (SELECT COUNT(*) FROM chapters WHERE novelId=?), totalWords = (SELECT COALESCE(SUM(wordCount),0) FROM chapters WHERE novelId=?) WHERE id=?", [novelId, novelId, novelId]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/admin/chapters/:id", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const { title, content } = req.body;
      const wordCount = content ? content.replace(/\s+/g, "").length : undefined;
      const sets = [];
      const vals: any[] = [];
      if (title) { sets.push("title=?"); vals.push(title); }
      if (content) { sets.push("content=?"); vals.push(content); if (wordCount) { sets.push("wordCount=?"); vals.push(wordCount); } }
      vals.push(req.params.id);
      await pool.execute(`UPDATE chapters SET ${sets.join(",")} WHERE id=?`, vals);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/admin/chapters/:id", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const [ch]: any = await pool.execute("SELECT novelId FROM chapters WHERE id=?", [req.params.id]);
      await pool.execute("DELETE FROM chapters WHERE id=?", [req.params.id]);
      if (ch.length > 0) {
        await pool.execute("UPDATE novels SET totalChapters = (SELECT COUNT(*) FROM chapters WHERE novelId=?), totalWords = (SELECT COALESCE(SUM(wordCount),0) FROM chapters WHERE novelId=?) WHERE id=?", [ch[0].novelId, ch[0].novelId, ch[0].novelId]);
      }
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Admin: Manage users
  app.get("/api/admin/users", authMiddleware(["admin", "ceo"]), async (req, res) => {
    try {
      const { search, limit: lim, offset: off } = req.query;
      let sql = "SELECT id, memberId, username, email, firstName, lastName, phone, province, role, points, freeReadUntil, isActive, createdAt, lastLoginAt FROM users WHERE 1=1";
      const params: any[] = [];
      if (search) { sql += " AND (username LIKE ? OR email LIKE ? OR memberId LIKE ? OR firstName LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
      const limitNum = parseInt(lim as string) || 50;
      const offsetNum = parseInt(off as string) || 0;
      sql += ` ORDER BY createdAt DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/admin/users/:id", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const { points, isActive, freeReadUntil, role } = req.body;
      const sets: string[] = [];
      const vals: any[] = [];
      if (points !== undefined) { sets.push("points=?"); vals.push(points); }
      if (isActive !== undefined) { sets.push("isActive=?"); vals.push(isActive); }
      if (freeReadUntil !== undefined) { sets.push("freeReadUntil=?"); vals.push(freeReadUntil); }
      if (role !== undefined) { sets.push("role=?"); vals.push(role); }
      vals.push(req.params.id);
      await pool.execute(`UPDATE users SET ${sets.join(",")} WHERE id=?`, vals);
      if (points !== undefined) {
        const diff = points;
        await pool.execute("INSERT INTO point_transactions (userId, amount, type, description) VALUES (?, ?, 'admin_adjust', 'ปรับแต้มโดย Admin')", [req.params.id, diff]);
      }
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Admin: API Keys
  app.get("/api/admin/api-keys", authMiddleware(["admin", "ceo"]), async (_req, res) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM api_keys ORDER BY id");
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/admin/api-keys", authMiddleware(["admin", "ceo"]), async (req, res) => {
    try {
      const { keyValue, provider } = req.body;
      await pool.execute("INSERT INTO api_keys (keyValue, provider) VALUES (?, ?)", [keyValue, provider || "gemini"]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.delete("/api/admin/api-keys/:id", authMiddleware(["admin", "ceo"]), async (req, res) => {
    try {
      await pool.execute("DELETE FROM api_keys WHERE id=?", [req.params.id]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/admin/api-keys/:id", authMiddleware(["admin", "ceo"]), async (req, res) => {
    try {
      const { isActive } = req.body;
      await pool.execute("UPDATE api_keys SET isActive=? WHERE id=?", [isActive, req.params.id]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Admin: Settings
  app.get("/api/admin/settings", authMiddleware(["admin", "ceo"]), async (_req, res) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM settings ORDER BY id");
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/admin/settings", authMiddleware(["admin", "ceo"]), async (req, res) => {
    try {
      const settings = req.body;
      for (const [key, value] of Object.entries(settings)) {
        await pool.execute("UPDATE settings SET settingValue=? WHERE settingKey=?", [value as string, key]);
      }
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ AI GENERATE (DOONOVEL) ============
  app.post("/api/admin/generate-novel", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const { category, numNovels, numChapters, wordsPerChapter, tone } = req.body;
      // Get available API keys
      const [keys]: any = await pool.execute("SELECT * FROM api_keys WHERE isActive=1 AND provider='gemini'");
      if (keys.length === 0) return res.status(400).json({ error: "ไม่มี API Key ที่ใช้งานได้" });

      const totalCalls = Math.ceil((numNovels * numChapters) / 3);
      const [job]: any = await pool.execute(
        "INSERT INTO generation_jobs (type, status, config, totalTasks, createdBy) VALUES ('novel', 'pending', ?, ?, ?)",
        [JSON.stringify({ category, numNovels, numChapters, wordsPerChapter: wordsPerChapter || 1300, tone: tone || "ดราม่าเข้ม" }), totalCalls, req.user.id]
      );
      res.json({ success: true, jobId: job.insertId, totalCalls, keysAvailable: keys.length });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // AI: Generate chapters for a specific novel
  app.post("/api/admin/ai-generate-chapters", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const { novelId, numCalls, startChapter } = req.body;
      const [keys]: any = await pool.execute("SELECT * FROM api_keys WHERE isActive=1 AND provider='gemini' ORDER BY usageCount ASC");
      if (keys.length === 0) return res.status(400).json({ error: "ไม่มี API Key" });
      const [novel]: any = await pool.execute("SELECT * FROM novels WHERE id=?", [novelId]);
      if (novel.length === 0) return res.status(404).json({ error: "ไม่พบนิยาย" });

      const [settings]: any = await pool.execute("SELECT settingKey, settingValue FROM settings WHERE settingKey IN ('gemini_model','words_per_chapter_min','words_per_chapter_max','chapters_per_call')");
      const config: any = {};
      settings.forEach((s: any) => { config[s.settingKey] = s.settingValue; });

      const model = config.gemini_model || "gemini-2.5-flash-lite";
      const chaptersPerCall = parseInt(config.chapters_per_call || "3");
      const wordsMin = config.words_per_chapter_min || "1200";
      const wordsMax = config.words_per_chapter_max || "1500";

      const results: any[] = [];
      let currentChapter = startChapter || (novel[0].totalChapters + 1);

      for (let call = 0; call < (numCalls || 1); call++) {
        const key = keys[call % keys.length];
        const prompt = `เขียนนิยายภาษาไทย แนว: ${novel[0].category} ชื่อเรื่อง: "${novel[0].title}"
โทน: ดราม่าเข้ม จำนวน ${chaptersPerCall} ตอน ตอนละ ${wordsMin}-${wordsMax} คำ
เริ่มจากตอนที่ ${currentChapter}
ต้องมี: Hook แรง 3 บรรทัดแรก, ตัวละครชัด, ไม่ผิดกฎหมาย, ไม่ซ้ำ, เนื้อเรื่องต่อเนื่อง
ห้ามใช้อักขระพิเศษ # * ในเนื้อหา
ตอบเป็น JSON array: [{"title":"ตอนที่ X — ชื่อตอน","content":"เนื้อหา..."}]`;

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.keyValue}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 8192 } })
            }
          );
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          // Try to parse JSON from response
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const chapters = JSON.parse(jsonMatch[0]);
            for (const ch of chapters) {
              const wordCount = ch.content.replace(/\s+/g, "").length;
              await pool.execute(
                "INSERT INTO chapters (novelId, chapterNumber, title, content, wordCount) VALUES (?, ?, ?, ?, ?)",
                [novelId, currentChapter, ch.title, ch.content, wordCount]
              );
              results.push({ chapterNumber: currentChapter, title: ch.title, wordCount });
              currentChapter++;
            }
          }
          await pool.execute("UPDATE api_keys SET usageCount = usageCount + 1, lastUsedAt = NOW() WHERE id=?", [key.id]);
        } catch (err: any) {
          results.push({ error: err.message, call });
        }
      }

      // Update novel stats
      await pool.execute("UPDATE novels SET totalChapters = (SELECT COUNT(*) FROM chapters WHERE novelId=?), totalWords = (SELECT COALESCE(SUM(wordCount),0) FROM chapters WHERE novelId=?), status='writing' WHERE id=?", [novelId, novelId, novelId]);
      res.json({ success: true, results, chaptersCreated: results.filter(r => !r.error).length });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ AI PROOFREAD (DOOPROOF) ============
  app.post("/api/admin/proofread", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const { novelId, chapterId } = req.body;
      const [keys]: any = await pool.execute("SELECT * FROM api_keys WHERE isActive=1 AND provider='gemini' ORDER BY usageCount ASC LIMIT 1");
      if (keys.length === 0) return res.status(400).json({ error: "ไม่มี API Key" });

      let sql = "SELECT * FROM chapters WHERE qualityChecked=0";
      const params: any[] = [];
      if (novelId) { sql += " AND novelId=?"; params.push(novelId); }
      if (chapterId) { sql += " AND id=?"; params.push(chapterId); }
      sql += " LIMIT 20";
      const [chapters]: any = await pool.execute(sql, params);

      const results: any[] = [];
      for (const ch of chapters) {
        const key = keys[0];
        const prompt = `พิสูจน์อักษรนิยายภาษาไทยต่อไปนี้ ตรวจสอบ:
1. คำสะกดผิด
2. ไวยากรณ์
3. ความสละสลวย
4. ความต่อเนื่องของเนื้อเรื่อง
5. ให้คะแนนคุณภาพ 0-100

เนื้อหา: ${ch.content.substring(0, 3000)}

ตอบเป็น JSON: {"score":90,"issues":["..."],"correctedContent":"เนื้อหาที่แก้ไขแล้ว..."}`;

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key.keyValue}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3 } })
            }
          );
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            if (result.score >= 90 && result.correctedContent) {
              await pool.execute("UPDATE chapters SET content=?, qualityChecked=1, qualityScore=? WHERE id=?", [result.correctedContent, result.score, ch.id]);
            } else {
              await pool.execute("UPDATE chapters SET qualityScore=? WHERE id=?", [result.score, ch.id]);
            }
            results.push({ chapterId: ch.id, score: result.score, issues: result.issues?.length || 0 });
          }
          await pool.execute("UPDATE api_keys SET usageCount = usageCount + 1, lastUsedAt = NOW() WHERE id=?", [key.id]);
        } catch (err: any) {
          results.push({ chapterId: ch.id, error: err.message });
        }
      }
      res.json({ success: true, results, processed: results.length });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Admin: Generation jobs
  app.get("/api/admin/jobs", authMiddleware(["admin", "ceo"]), async (_req, res) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM generation_jobs ORDER BY createdAt DESC LIMIT 50");
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ STATIC FILES ============
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`NiYAIFREE Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
