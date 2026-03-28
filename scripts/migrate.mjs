import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'hbdwXtYjXKh7yfm.root',
  password: 'Te4jOksAz0hiZq9w',
  database: 'test',
  ssl: { rejectUnauthorized: true }
};

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    memberId VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    phone VARCHAR(20),
    province VARCHAR(100),
    role ENUM('member','admin','ceo') NOT NULL DEFAULT 'member',
    points INT NOT NULL DEFAULT 100,
    freeReadUntil DATETIME NULL,
    referralCode VARCHAR(20) UNIQUE,
    referredBy INT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    lastLoginAt DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS novels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    author VARCHAR(200) DEFAULT 'NiYAIFREE',
    category VARCHAR(100) NOT NULL DEFAULT 'แฟนตาซี',
    description TEXT,
    coverUrl TEXT,
    ageRating VARCHAR(10) DEFAULT 'ทั่วไป',
    status ENUM('draft','writing','completed','published') NOT NULL DEFAULT 'draft',
    totalChapters INT NOT NULL DEFAULT 0,
    totalWords INT NOT NULL DEFAULT 0,
    viewCount INT NOT NULL DEFAULT 0,
    likeCount INT NOT NULL DEFAULT 0,
    qualityScore INT DEFAULT 0,
    isFeatured BOOLEAN NOT NULL DEFAULT FALSE,
    seoTitle VARCHAR(500),
    seoDescription TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_featured (isFeatured),
    INDEX idx_viewCount (viewCount)
  )`,

  `CREATE TABLE IF NOT EXISTS chapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    novelId INT NOT NULL,
    chapterNumber INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    content LONGTEXT NOT NULL,
    wordCount INT NOT NULL DEFAULT 0,
    qualityChecked BOOLEAN NOT NULL DEFAULT FALSE,
    qualityScore INT DEFAULT 0,
    viewCount INT NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_novel_chapter (novelId, chapterNumber),
    INDEX idx_novelId (novelId),
    FOREIGN KEY (novelId) REFERENCES novels(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS read_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    novelId INT NOT NULL,
    chapterId INT NOT NULL,
    chapterNumber INT NOT NULL DEFAULT 0,
    duration INT NOT NULL DEFAULT 0,
    progress DECIMAL(5,2) NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_novelId (novelId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (novelId) REFERENCES novels(id) ON DELETE CASCADE,
    FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    novelId INT NOT NULL,
    chapterId INT NULL,
    chapterNumber INT NOT NULL DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_novel (userId, novelId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (novelId) REFERENCES novels(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS point_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount INT NOT NULL,
    type ENUM('signup','referral','share','watch_ad','mini_game','read_chapter','admin_adjust','promo') NOT NULL,
    description VARCHAR(500),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyValue VARCHAR(500) NOT NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    usageCount INT NOT NULL DEFAULT 0,
    lastUsedAt DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS generation_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('novel','proof','cover') NOT NULL,
    status ENUM('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
    config JSON,
    progress INT NOT NULL DEFAULT 0,
    totalTasks INT NOT NULL DEFAULT 0,
    completedTasks INT NOT NULL DEFAULT 0,
    errorMessage TEXT,
    createdBy INT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_type (type)
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    settingKey VARCHAR(100) NOT NULL UNIQUE,
    settingValue TEXT NOT NULL,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`
];

const DEFAULT_SETTINGS = [
  ['points_signup', '100'],
  ['points_referral', '100'],
  ['points_share', '10'],
  ['points_watch_ad', '10'],
  ['points_mini_game_min', '10'],
  ['points_mini_game_max', '30'],
  ['points_per_chapter', '3'],
  ['free_read_days', '7'],
  ['adsense_header', ''],
  ['adsense_sidebar', ''],
  ['adsense_content', ''],
  ['site_name', 'NiYAIFREE'],
  ['site_description', 'อ่านนิยายฟรี ครบทุกแนว'],
  ['gemini_model', 'gemini-2.5-flash-lite'],
  ['chapters_per_call', '3'],
  ['words_per_chapter_min', '1200'],
  ['words_per_chapter_max', '1500'],
  ['parallel_novels', '20'],
  ['quality_pass_score', '90'],
];

async function migrate() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('Connected to TiDB Cloud');

  for (const sql of TABLES) {
    const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    await conn.execute(sql);
    console.log(`✓ Table "${tableName}" created/verified`);
  }

  // Insert default settings
  for (const [key, value] of DEFAULT_SETTINGS) {
    await conn.execute(
      'INSERT IGNORE INTO settings (settingKey, settingValue) VALUES (?, ?)',
      [key, value]
    );
  }
  console.log('✓ Default settings inserted');

  // Create default admin account
  const bcrypt = await import('bcryptjs');
  const adminHash = bcrypt.hashSync('252333', 10);
  await conn.execute(
    `INSERT IGNORE INTO users (memberId, username, email, passwordHash, firstName, lastName, role, points, referralCode)
     VALUES ('M0000001', 'admin111', 'admin@niyaifree.com', ?, 'แอดมิน', 'ระบบ', 'admin', 99999, 'ADMIN001')`,
    [adminHash]
  );
  console.log('✓ Default admin account created (admin111 / 252333)');

  // Create CEO account
  const ceoHash = bcrypt.hashSync('252333', 10);
  await conn.execute(
    `INSERT IGNORE INTO users (memberId, username, email, passwordHash, firstName, lastName, role, points, referralCode)
     VALUES ('M0000000', 'ceo999', 'ceo@niyaifree.com', ?, 'CEO', 'iDea Memory', 'ceo', 99999, 'CEO999')`,
    [ceoHash]
  );
  console.log('✓ Default CEO account created (ceo999 / 252333)');

  await conn.end();
  console.log('\\nMigration completed successfully!');
}

migrate().catch(console.error);
