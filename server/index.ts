import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import PDFDocument from "pdfkit";

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

  async function logAudit(userId: number, action: string, targetType?: string, targetId?: number, details?: any) {
    try {
      await pool.execute("INSERT INTO audit_logs (userId, action, targetType, targetId, details) VALUES (?, ?, ?, ?, ?)",
        [userId, action, targetType || null, targetId || null, details ? JSON.stringify(details) : null]);
    } catch {}
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

      if (referralCode) {
        const [referrer]: any = await pool.execute("SELECT id FROM users WHERE referralCode=?", [referralCode]);
        if (referrer.length > 0) {
          const [refSettings]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='points_referral'");
          const refPoints = parseInt(refSettings[0]?.settingValue || "100");
          await pool.execute("UPDATE users SET points = points + ? WHERE id = ?", [refPoints, referrer[0].id]);
          await pool.execute("INSERT INTO point_transactions (userId, amount, type, description) VALUES (?, ?, 'referral', ?)", [referrer[0].id, refPoints, `แนะนำสมาชิก ${username}`]);
        }
      }

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
      if (!login || !password) return res.status(400).json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
      const [rows]: any = await pool.execute(
        "SELECT * FROM users WHERE username=? OR email=? OR memberId=? OR phone=?",
        [login, login, String(login).toUpperCase(), login]
      );
      if (rows.length === 0) return res.status(401).json({ error: "ไม่พบบัญชี" });
      const user = rows[0];
      if (!user.isActive) return res.status(403).json({ error: "บัญชีถูกระงับ" });
      if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
      await pool.execute("UPDATE users SET lastLoginAt=NOW() WHERE id=?", [user.id]);
      const token = await createToken(user);
      res.json({ success: true, token, user: { id: user.id, memberId: user.memberId, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, points: user.points, coins: user.coins || 0, vipUntil: user.vipUntil, freeReadUntil: user.freeReadUntil, referralCode: user.referralCode, avatarUrl: user.avatarUrl, bio: user.bio } });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/auth/me", authMiddleware(), async (req: any, res) => {
    const [rows]: any = await pool.execute("SELECT id, memberId, username, email, firstName, lastName, phone, province, role, points, coins, vipUntil, vipEbookDownloads, vipEbookLimit, freeReadUntil, referralCode, avatarUrl, bio, createdAt FROM users WHERE id=?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  });

  // ============ CEO LOGIN (SEPARATE) ============
  app.post("/api/ceo/login", async (req, res) => {
    try {
      const { login, password } = req.body;
      if (!login || !password) return res.status(400).json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
      const [rows]: any = await pool.execute(
        "SELECT * FROM users WHERE (username=? OR email=? OR memberId=?) AND role='ceo'",
        [login, login, String(login).toUpperCase()]
      );
      if (rows.length === 0) return res.status(401).json({ error: "ไม่พบบัญชี CEO" });
      const user = rows[0];
      if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
      await pool.execute("UPDATE users SET lastLoginAt=NOW() WHERE id=?", [user.id]);
      const token = await createToken(user);
      await logAudit(user.id, "ceo_login", "user", user.id);
      res.json({ success: true, token, user: { id: user.id, memberId: user.memberId, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, points: user.points, coins: user.coins || 0 } });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ CEO ROUTES ============
  app.get("/api/ceo/stats", authMiddleware(["ceo"]), async (_req, res) => {
    try {
      const [users]: any = await pool.execute("SELECT COUNT(*) as c FROM users");
      const [novels]: any = await pool.execute("SELECT COUNT(*) as c FROM novels");
      const [chapters]: any = await pool.execute("SELECT COUNT(*) as c FROM chapters");
      const [views]: any = await pool.execute("SELECT SUM(viewCount) as c FROM novels");
      const [vipUsers]: any = await pool.execute("SELECT COUNT(*) as c FROM users WHERE vipUntil > NOW()");
      const [totalCoins]: any = await pool.execute("SELECT SUM(coins) as c FROM users");
      const [recentUsers]: any = await pool.execute("SELECT COUNT(*) as c FROM users WHERE createdAt > DATE_SUB(NOW(), INTERVAL 7 DAY)");
      const [topNovels]: any = await pool.execute("SELECT id, title, viewCount, likeCount FROM novels ORDER BY viewCount DESC LIMIT 10");
      const [categoryStats]: any = await pool.execute("SELECT category, COUNT(*) as count, SUM(viewCount) as views FROM novels GROUP BY category ORDER BY views DESC");
      const [apiKeys]: any = await pool.execute("SELECT COUNT(*) as total, SUM(CASE WHEN isActive=1 THEN 1 ELSE 0 END) as active, SUM(usageCount) as totalUsage FROM api_keys");
      const [subscriptions]: any = await pool.execute("SELECT COUNT(*) as c, SUM(amount) as revenue FROM subscriptions WHERE isActive=1");
      const [coinPurchases]: any = await pool.execute("SELECT SUM(amount) as totalCoins FROM coin_transactions WHERE type='purchase'");
      const [usersByRole]: any = await pool.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role");
      res.json({
        totalUsers: users[0].c, totalNovels: novels[0].c, totalChapters: chapters[0].c,
        totalViews: views[0].c || 0, vipUsers: vipUsers[0].c, totalCoinsInSystem: totalCoins[0].c || 0,
        recentUsers: recentUsers[0].c, topNovels, categoryStats, apiKeys: apiKeys[0],
        subscriptionRevenue: subscriptions[0].revenue || 0, activeSubscriptions: subscriptions[0].c,
        totalCoinsPurchased: coinPurchases[0].totalCoins || 0, usersByRole
      });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/ceo/audit-logs", authMiddleware(["ceo"]), async (req, res) => {
    try {
      const { action, limit: lim, offset: off } = req.query;
      let sql = "SELECT al.*, u.username, u.memberId FROM audit_logs al LEFT JOIN users u ON al.userId = u.id WHERE 1=1";
      const params: any[] = [];
      if (action) { sql += " AND al.action=?"; params.push(action); }
      const limitNum = parseInt(lim as string) || 50;
      const offsetNum = parseInt(off as string) || 0;
      sql += ` ORDER BY al.createdAt DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/ceo/financials", authMiddleware(["ceo"]), async (_req, res) => {
    try {
      const [subsByMonth]: any = await pool.execute("SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count, SUM(amount) as revenue FROM subscriptions GROUP BY month ORDER BY month DESC LIMIT 12");
      const [coinsByMonth]: any = await pool.execute("SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, type, SUM(amount) as total FROM coin_transactions GROUP BY month, type ORDER BY month DESC LIMIT 50");
      const [ebooksByMonth]: any = await pool.execute("SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count, SUM(coinCost) as totalCoins FROM ebook_downloads GROUP BY month ORDER BY month DESC LIMIT 12");
      res.json({ subscriptionsByMonth: subsByMonth, coinsByMonth, ebooksByMonth });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/ceo/users", authMiddleware(["ceo"]), async (req, res) => {
    try {
      const { search, role, limit: lim, offset: off } = req.query;
      let sql = "SELECT id, memberId, username, email, firstName, lastName, phone, province, role, points, coins, vipUntil, vipEbookDownloads, isActive, createdAt, lastLoginAt FROM users WHERE 1=1";
      const params: any[] = [];
      if (search) { sql += " AND (username LIKE ? OR email LIKE ? OR memberId LIKE ? OR firstName LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
      if (role) { sql += " AND role=?"; params.push(role); }
      const limitNum = parseInt(lim as string) || 50;
      const offsetNum = parseInt(off as string) || 0;
      sql += ` ORDER BY createdAt DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;
      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.put("/api/ceo/users/:id", authMiddleware(["ceo"]), async (req: any, res) => {
    try {
      const fields = req.body;
      const allowed = ["points", "coins", "isActive", "freeReadUntil", "vipUntil", "role", "firstName", "lastName", "phone", "province", "vipEbookDownloads", "vipEbookLimit"];
      const sets: string[] = [];
      const vals: any[] = [];
      for (const k of allowed) {
        if (fields[k] !== undefined) { sets.push(`${k}=?`); vals.push(fields[k]); }
      }
      if (sets.length === 0) return res.status(400).json({ error: "No fields" });
      vals.push(req.params.id);
      await pool.execute(`UPDATE users SET ${sets.join(",")} WHERE id=?`, vals);
      await logAudit(req.user.id, "ceo_update_user", "user", parseInt(req.params.id), fields);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/ceo/users", authMiddleware(["ceo"]), async (req: any, res) => {
    try {
      const { username, email, password, firstName, lastName, role, points, coins } = req.body;
      const hash = bcrypt.hashSync(password || "252333", 10);
      const [countResult]: any = await pool.execute("SELECT COUNT(*) as c FROM users");
      const nextNum = countResult[0].c + 1;
      const memberId = role === "ceo" ? `CEO${String(nextNum).padStart(4, "0")}` : `M${String(nextNum).padStart(7, "0")}`;
      const myReferral = `REF${Date.now().toString(36).toUpperCase()}`;
      await pool.execute(
        `INSERT INTO users (memberId, username, email, passwordHash, firstName, lastName, role, points, coins, referralCode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [memberId, username, email, hash, firstName || "", lastName || "", role || "member", points || 100, coins || 0, myReferral]
      );
      await logAudit(req.user.id, "ceo_create_user", "user", null as any, { username, role });
      res.json({ success: true, memberId });
    } catch (e: any) {
      if (e.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "ชื่อผู้ใช้หรืออีเมลซ้ำ" });
      res.status(500).json({ error: e.message });
    }
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
      const [user]: any = await pool.execute("SELECT points, freeReadUntil, vipUntil FROM users WHERE id=?", [req.user.id]);
      if (user[0].freeReadUntil && new Date(user[0].freeReadUntil) > new Date()) {
        return res.json({ success: true, free: true, pointsRemaining: user[0].points });
      }
      if (user[0].vipUntil && new Date(user[0].vipUntil) > new Date()) {
        return res.json({ success: true, vip: true, pointsRemaining: user[0].points });
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

  app.put("/api/member/profile", authMiddleware(), async (req: any, res) => {
    try {
      const { firstName, lastName, phone, province, bio, avatarUrl } = req.body;
      const sets: string[] = [];
      const vals: any[] = [];
      if (firstName !== undefined) { sets.push("firstName=?"); vals.push(firstName); }
      if (lastName !== undefined) { sets.push("lastName=?"); vals.push(lastName); }
      if (phone !== undefined) { sets.push("phone=?"); vals.push(phone); }
      if (province !== undefined) { sets.push("province=?"); vals.push(province); }
      if (bio !== undefined) { sets.push("bio=?"); vals.push(bio); }
      if (avatarUrl !== undefined) { sets.push("avatarUrl=?"); vals.push(avatarUrl); }
      if (sets.length === 0) return res.status(400).json({ error: "No fields" });
      vals.push(req.user.id);
      await pool.execute(`UPDATE users SET ${sets.join(",")} WHERE id=?`, vals);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/member/change-password", authMiddleware(), async (req: any, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) return res.status(400).json({ error: "กรุณากรอกรหัสผ่านให้ครบ" });
      if (newPassword.length < 6) return res.status(400).json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
      const [rows]: any = await pool.execute("SELECT passwordHash FROM users WHERE id=?", [req.user.id]);
      if (!rows[0]) return res.status(404).json({ error: "ไม่พบผู้ใช้" });
      const valid = await bcrypt.compare(oldPassword, rows[0].passwordHash);
      if (!valid) return res.status(400).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.execute("UPDATE users SET passwordHash=? WHERE id=?", [hashed, req.user.id]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/member/point-history", authMiddleware(), async (req: any, res) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM point_transactions WHERE userId=? ORDER BY createdAt DESC LIMIT 50", [req.user.id]);
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ VIP & COINS ============
  app.post("/api/member/subscribe-vip", authMiddleware(), async (req: any, res) => {
    try {
      const { paymentMethod, paymentRef } = req.body;
      const [priceRow]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='vip_price'");
      const price = parseFloat(priceRow[0]?.settingValue || "100");
      const endDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 19).replace("T", " ");
      await pool.execute(
        "INSERT INTO subscriptions (userId, plan, amount, endDate, paymentMethod, paymentRef) VALUES (?, 'vip', ?, ?, ?, ?)",
        [req.user.id, price, endDate, paymentMethod || "manual", paymentRef || ""]
      );
      await pool.execute("UPDATE users SET vipUntil=?, vipEbookDownloads=0 WHERE id=?", [endDate, req.user.id]);
      await logAudit(req.user.id, "subscribe_vip", "user", req.user.id, { price, endDate });
      res.json({ success: true, vipUntil: endDate, price });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/member/purchase-coins", authMiddleware(), async (req: any, res) => {
    try {
      const { amount, paymentMethod, paymentRef } = req.body;
      const minPurchase = 100;
      if (amount < minPurchase) return res.status(400).json({ error: `ขั้นต่ำ ${minPurchase} Coins` });
      await pool.execute("UPDATE users SET coins = coins + ? WHERE id=?", [amount, req.user.id]);
      await pool.execute("INSERT INTO coin_transactions (userId, amount, type, description) VALUES (?, ?, 'purchase', ?)", [req.user.id, amount, `ซื้อ ${amount} Coins`]);
      await logAudit(req.user.id, "purchase_coins", "user", req.user.id, { amount });
      const [user]: any = await pool.execute("SELECT coins FROM users WHERE id=?", [req.user.id]);
      res.json({ success: true, coinsAdded: amount, totalCoins: user[0].coins });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/member/coin-history", authMiddleware(), async (req: any, res) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM coin_transactions WHERE userId=? ORDER BY createdAt DESC LIMIT 50", [req.user.id]);
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/member/download-ebook", authMiddleware(), async (req: any, res) => {
    try {
      const { novelId } = req.body;
      const [user]: any = await pool.execute("SELECT coins, vipUntil, vipEbookDownloads, vipEbookLimit FROM users WHERE id=?", [req.user.id]);
      const u = user[0];
      const isVip = u.vipUntil && new Date(u.vipUntil) > new Date();
      const [costRow]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='coin_per_ebook'");
      const coinCost = parseInt(costRow[0]?.settingValue || "10");

      if (isVip && u.vipEbookDownloads < u.vipEbookLimit) {
        await pool.execute("UPDATE users SET vipEbookDownloads = vipEbookDownloads + 1 WHERE id=?", [req.user.id]);
        await pool.execute("INSERT INTO ebook_downloads (userId, novelId, coinCost, format) VALUES (?, ?, 0, 'pdf')", [req.user.id, novelId]);
        return res.json({ success: true, method: "vip", downloadsUsed: u.vipEbookDownloads + 1, downloadsLimit: u.vipEbookLimit });
      }

      if (u.coins < coinCost) return res.status(400).json({ error: `Coin ไม่พอ ต้องใช้ ${coinCost} Coins`, coinsNeeded: coinCost, coinsHave: u.coins });
      await pool.execute("UPDATE users SET coins = coins - ? WHERE id=?", [coinCost, req.user.id]);
      await pool.execute("INSERT INTO coin_transactions (userId, amount, type, description, relatedId) VALUES (?, ?, 'use_ebook', ?, ?)", [req.user.id, -coinCost, `โหลด eBook`, novelId]);
      await pool.execute("INSERT INTO ebook_downloads (userId, novelId, coinCost, format) VALUES (?, ?, ?, 'pdf')", [req.user.id, novelId, coinCost]);
      res.json({ success: true, method: "coins", coinsUsed: coinCost });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ EBOOK PDF GENERATION ============
  app.get("/api/ebook/generate-pdf/:novelId", authMiddleware(), async (req: any, res: any) => {
    try {
      const novelId = parseInt(req.params.novelId);
      // Check if user already has a valid download record (purchased within last 30 days)
      const [existing]: any = await pool.execute(
        "SELECT id FROM ebook_downloads WHERE userId=? AND novelId=? AND createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY) LIMIT 1",
        [req.user.id, novelId]
      );
      if (!existing[0]) {
        // Must purchase first via /api/member/download-ebook
        return res.status(403).json({ error: "กรุณาซื้อ eBook ก่อนดาวน์โหลด" });
      }

      // Fetch novel
      const [novels]: any = await pool.execute("SELECT * FROM novels WHERE id=?", [novelId]);
      if (!novels[0]) return res.status(404).json({ error: "ไม่พบนิยาย" });
      const novel = novels[0];

      // Fetch all chapters
      const [chapters]: any = await pool.execute(
        "SELECT chapterNumber, title, content FROM chapters WHERE novelId=? ORDER BY chapterNumber ASC",
        [novelId]
      );
      if (chapters.length === 0) return res.status(400).json({ error: "นิยายยังไม่มีตอน" });

      // Font paths
      const fontsDir = path.resolve(__dirname, "..", "server", "fonts");
      const sarabunRegular = path.join(fontsDir, "Sarabun-Regular.ttf");
      const sarabunBold = path.join(fontsDir, "Sarabun-Bold.ttf");
      const kanitBold = path.join(fontsDir, "Kanit-Bold.ttf");

      // Create PDF
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 72, bottom: 72, left: 60, right: 60 },
        info: {
          Title: novel.title,
          Author: novel.author || "NiYAIFREE",
          Subject: `${novel.category} — ${novel.title}`,
          Creator: "NiYAIFREE — niyaifree.com",
        },
        bufferPages: true,
      });

      // Set response headers
      const asciiTitle = novel.title.replace(/[^a-zA-Z0-9]/g, "_");
      const utf8Title = encodeURIComponent(novel.title);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${asciiTitle}.pdf"; filename*=UTF-8''${utf8Title}.pdf`);
      doc.pipe(res);

      // Register fonts
      doc.registerFont("Sarabun", sarabunRegular);
      doc.registerFont("Sarabun-Bold", sarabunBold);
      doc.registerFont("Kanit-Bold", kanitBold);

      // ---- COVER PAGE ----
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#E8453C");
      doc.fill("#FFFFFF");
      doc.font("Kanit-Bold").fontSize(36).text(novel.title, 60, 200, {
        align: "center",
        width: doc.page.width - 120,
      });
      doc.moveDown(1);
      doc.font("Sarabun").fontSize(16).text(novel.author || "NiYAIFREE", {
        align: "center",
        width: doc.page.width - 120,
      });
      doc.moveDown(0.5);
      doc.font("Sarabun").fontSize(12).text(novel.category || "", {
        align: "center",
        width: doc.page.width - 120,
      });
      // Logo at bottom
      doc.font("Kanit-Bold").fontSize(14).text("NiYAIFREE", 60, doc.page.height - 140, {
        align: "center",
        width: doc.page.width - 120,
      });
      doc.font("Sarabun").fontSize(10).text("niyaifree.com", {
        align: "center",
        width: doc.page.width - 120,
      });

      // ---- TABLE OF CONTENTS ----
      doc.addPage();
      doc.fill("#1a1a1a");
      doc.font("Kanit-Bold").fontSize(24).text("สารบัญ", { align: "center" });
      doc.moveDown(1.5);
      for (const ch of chapters) {
        const chTitle = ch.title ? `ตอนที่ ${ch.chapterNumber} — ${ch.title}` : `ตอนที่ ${ch.chapterNumber}`;
        doc.font("Sarabun").fontSize(12).text(chTitle, { continued: false });
        doc.moveDown(0.3);
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
      }

      // ---- CHAPTERS ----
      for (const ch of chapters) {
        doc.addPage();
        // Chapter header
        doc.fill("#E8453C");
        const chTitle = ch.title ? `ตอนที่ ${ch.chapterNumber} — ${ch.title}` : `ตอนที่ ${ch.chapterNumber}`;
        doc.font("Kanit-Bold").fontSize(20).text(chTitle, { align: "center" });
        doc.moveDown(1);
        // Divider line
        doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor("#E8453C").lineWidth(1).stroke();
        doc.moveDown(1);

        // Chapter content
        doc.fill("#333333");
        const content = (ch.content || "").replace(/[#*]/g, "").trim();
        const paragraphs = content.split(/\n\n|\n/);
        for (const para of paragraphs) {
          const trimmed = para.trim();
          if (!trimmed) continue;
          doc.font("Sarabun").fontSize(13).text(trimmed, {
            align: "left",
            lineGap: 6,
            paragraphGap: 8,
          });
          doc.moveDown(0.5);
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }
        }
      }

      // ---- COPYRIGHT PAGE ----
      doc.addPage();
      doc.fill("#E8453C");
      doc.font("Kanit-Bold").fontSize(18).text("คำเตือนเรื่องลิขสิทธิ์", { align: "center" });
      doc.moveDown(1);
      doc.fill("#333333");
      doc.font("Sarabun").fontSize(11).text(
        `ห้ามคัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ หรือจำหน่ายเนื้อหาในหนังสือเล่มนี้ ` +
        `ไม่ว่าทั้งหมดหรือบางส่วน โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร ` +
        `จากบริษัท ตามพระราชบัญญัติลิขสิทธิ์ พ.ศ. 2537 และกฎหมายที่เกี่ยวข้อง`,
        { align: "center", lineGap: 6 }
      );
      doc.moveDown(2);
      doc.font("Sarabun").fontSize(10).fillColor("#999999").text(
        `สร้างโดย NiYAIFREE — niyaifree.com\n` +
        `วันที่สร้าง: ${new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}`,
        { align: "center" }
      );

      // Add footer to all pages
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.font("Sarabun").fontSize(8).fillColor("#AAAAAA");
        if (i > 0) { // Skip cover page
          doc.text(
            `${novel.title} — NiYAIFREE.com | หน้า ${i}/${pageCount - 1}`,
            60, doc.page.height - 50,
            { align: "center", width: doc.page.width - 120 }
          );
        }
      }

      doc.end();
      await logAudit(req.user.id, "download_ebook_pdf", "novel", novelId, { title: novel.title });
    } catch (e: any) {
      console.error("PDF generation error:", e);
      if (!res.headersSent) res.status(500).json({ error: "สร้าง PDF ไม่สำเร็จ: " + e.message });
    }
  });

  // Check if user can download a specific novel (for frontend button state)
  app.get("/api/ebook/check/:novelId", authMiddleware(), async (req: any, res) => {
    try {
      const novelId = parseInt(req.params.novelId);
      const [user]: any = await pool.execute("SELECT coins, vipUntil, vipEbookDownloads, vipEbookLimit FROM users WHERE id=?", [req.user.id]);
      const u = user[0];
      const isVip = u.vipUntil && new Date(u.vipUntil) > new Date();
      const [costRow]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='coin_per_ebook'");
      const coinCost = parseInt(costRow[0]?.settingValue || "10");

      // Check if already purchased
      const [existing]: any = await pool.execute(
        "SELECT id FROM ebook_downloads WHERE userId=? AND novelId=? AND createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY) LIMIT 1",
        [req.user.id, novelId]
      );
      const alreadyPurchased = existing.length > 0;

      // Count chapters
      const [chCount]: any = await pool.execute("SELECT COUNT(*) as c FROM chapters WHERE novelId=?", [novelId]);

      res.json({
        alreadyPurchased,
        isVip,
        vipDownloadsUsed: u.vipEbookDownloads || 0,
        vipDownloadsLimit: u.vipEbookLimit || 10,
        coins: u.coins || 0,
        coinCost,
        chapterCount: chCount[0]?.c || 0,
      });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/member/download-history", authMiddleware(), async (req: any, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT ed.*, n.title, n.coverUrl FROM ebook_downloads ed JOIN novels n ON ed.novelId = n.id WHERE ed.userId=? ORDER BY ed.createdAt DESC LIMIT 50`,
        [req.user.id]
      );
      res.json(rows);
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
      await logAudit(req.user.id, "create_novel", "novel", result.insertId, { title, category });
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

  app.get("/api/admin/users", authMiddleware(["admin", "ceo"]), async (req, res) => {
    try {
      const { search, limit: lim, offset: off } = req.query;
      let sql = "SELECT id, memberId, username, email, firstName, lastName, phone, province, role, points, coins, vipUntil, isActive, createdAt, lastLoginAt FROM users WHERE 1=1";
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
      const { points, isActive, freeReadUntil, role, coins, vipUntil } = req.body;
      const sets: string[] = [];
      const vals: any[] = [];
      if (points !== undefined) { sets.push("points=?"); vals.push(points); }
      if (coins !== undefined) { sets.push("coins=?"); vals.push(coins); }
      if (isActive !== undefined) { sets.push("isActive=?"); vals.push(isActive); }
      if (freeReadUntil !== undefined) { sets.push("freeReadUntil=?"); vals.push(freeReadUntil); }
      if (vipUntil !== undefined) { sets.push("vipUntil=?"); vals.push(vipUntil); }
      if (role !== undefined) { sets.push("role=?"); vals.push(role); }
      vals.push(req.params.id);
      await pool.execute(`UPDATE users SET ${sets.join(",")} WHERE id=?`, vals);
      await logAudit(req.user.id, "admin_update_user", "user", parseInt(req.params.id), req.body);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/admin/users/:id/coins", authMiddleware(["admin", "ceo"]), async (req: any, res) => {
    try {
      const { amount, description } = req.body;
      await pool.execute("UPDATE users SET coins = coins + ? WHERE id=?", [amount, req.params.id]);
      await pool.execute("INSERT INTO coin_transactions (userId, amount, type, description) VALUES (?, ?, 'admin_adjust', ?)", [req.params.id, amount, description || "ปรับ Coins โดย Admin"]);
      await logAudit(req.user.id, "admin_adjust_coins", "user", parseInt(req.params.id), { amount, description });
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
      const [keys]: any = await pool.execute("SELECT * FROM api_keys WHERE isActive=1 AND provider='gemini'");
      if (keys.length === 0) return res.status(400).json({ error: "ไม่มี API Key ที่ใช้งานได้" });
      const totalCalls = Math.ceil((numNovels * numChapters) / 3);
      const [job]: any = await pool.execute(
        "INSERT INTO generation_jobs (type, status, config, totalTasks, createdBy) VALUES ('novel', 'pending', ?, ?, ?)",
        [JSON.stringify({ category, numNovels, numChapters, wordsPerChapter: wordsPerChapter || 1300, tone: tone || "ดราม่าเข้ม" }), totalCalls, req.user.id]
      );
      await logAudit(req.user.id, "generate_novel", "job", job.insertId, { category, numNovels, numChapters });
      res.json({ success: true, jobId: job.insertId, totalCalls, keysAvailable: keys.length });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

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

  app.get("/api/admin/jobs", authMiddleware(["admin", "ceo"]), async (_req, res) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM generation_jobs ORDER BY createdAt DESC LIMIT 50");
      res.json(rows);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ============ ADS.TXT PUBLIC ROUTE ============
  app.get("/ads.txt", async (_req, res) => {
    try {
      const [rows]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='ads_txt_content'");
      const content = rows[0]?.settingValue || "";
      if (content) {
        res.type("text/plain").send(content);
      } else {
        res.status(404).type("text/plain").send("# No ads.txt configured");
      }
    } catch { res.status(500).send("Error"); }
  });

  // ============ COPYRIGHT WARNING (PUBLIC) ============
  app.get("/api/copyright", async (_req, res) => {
    try {
      const [rows]: any = await pool.execute("SELECT settingValue FROM settings WHERE settingKey='copyright_warning'");
      res.json({ warning: rows[0]?.settingValue || "ห้ามกอปปี้ คัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ จำหน่าย โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท ตามกฎหมายลิขสิทธิ์ไทย พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537" });
    } catch { res.json({ warning: "" }); }
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
