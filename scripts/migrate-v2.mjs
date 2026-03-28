import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'hbdwXtYjXKh7yfm.root',
  password: 'Te4jOksAz0hiZq9w',
  database: 'test',
  ssl: { rejectUnauthorized: true }
};

async function migrate() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('Connected to TiDB Cloud');

  // Alter users: add vipUntil, coins, vipEbookDownloads, vipEbookLimit
  const alterCols = [
    ["vipUntil", "ALTER TABLE users ADD COLUMN vipUntil DATETIME NULL"],
    ["coins", "ALTER TABLE users ADD COLUMN coins INT NOT NULL DEFAULT 0"],
    ["vipEbookDownloads", "ALTER TABLE users ADD COLUMN vipEbookDownloads INT NOT NULL DEFAULT 0"],
    ["vipEbookLimit", "ALTER TABLE users ADD COLUMN vipEbookLimit INT NOT NULL DEFAULT 10"],
    ["avatarUrl", "ALTER TABLE users ADD COLUMN avatarUrl TEXT"],
    ["bio", "ALTER TABLE users ADD COLUMN bio TEXT"],
  ];
  for (const [col, sql] of alterCols) {
    try {
      await conn.execute(sql);
      console.log(`✓ Added column "${col}" to users`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate column')) {
        console.log(`- Column "${col}" already exists`);
      } else {
        console.error(`✗ Error adding "${col}":`, e.message);
      }
    }
  }

  // Create subscriptions table
  await conn.execute(`CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    plan ENUM('free','vip') NOT NULL DEFAULT 'free',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    startDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endDate DATETIME NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    paymentMethod VARCHAR(50) DEFAULT 'manual',
    paymentRef VARCHAR(200),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_active (isActive),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('✓ Table "subscriptions" created/verified');

  // Create coin_transactions table
  await conn.execute(`CREATE TABLE IF NOT EXISTS coin_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    amount INT NOT NULL,
    type ENUM('purchase','use_ebook','admin_adjust','refund','promo') NOT NULL,
    description VARCHAR(500),
    relatedId INT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_type (type),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('✓ Table "coin_transactions" created/verified');

  // Create ebook_downloads table
  await conn.execute(`CREATE TABLE IF NOT EXISTS ebook_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    novelId INT NOT NULL,
    format VARCHAR(10) NOT NULL DEFAULT 'pdf',
    coinCost INT NOT NULL DEFAULT 10,
    downloadUrl TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_novelId (novelId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (novelId) REFERENCES novels(id) ON DELETE CASCADE
  )`);
  console.log('✓ Table "ebook_downloads" created/verified');

  // Create audit_logs table for CEO tracking
  await conn.execute(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    targetType VARCHAR(50),
    targetId INT,
    details JSON,
    ipAddress VARCHAR(50),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_userId (userId),
    INDEX idx_action (action),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`);
  console.log('✓ Table "audit_logs" created/verified');

  // Add new settings
  const newSettings = [
    ['vip_price', '100'],
    ['vip_ebook_limit', '10'],
    ['coin_min_purchase', '100'],
    ['coin_per_ebook', '10'],
    ['copyright_warning', 'ห้ามกอปปี้ คัดลอก ทำซ้ำ ดัดแปลง เผยแพร่ จำหน่าย โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากบริษัท ตามกฎหมายลิขสิทธิ์ไทย พ.ร.บ.ลิขสิทธิ์ พ.ศ. 2537'],
    ['free_chapter_limit', '30'],
  ];
  for (const [key, value] of newSettings) {
    await conn.execute(
      'INSERT IGNORE INTO settings (settingKey, settingValue) VALUES (?, ?)',
      [key, value]
    );
  }
  console.log('✓ New settings inserted');

  // Create additional CEO accounts (ceo1-ceo3)
  const bcrypt = await import('bcryptjs');
  const ceoHash = bcrypt.hashSync('ceo252333', 10);
  for (let i = 1; i <= 3; i++) {
    const memberId = `CEO${String(i).padStart(4, '0')}`;
    const username = `ceo${i}`;
    const email = `ceo${i}@niyaifree.com`;
    try {
      await conn.execute(
        `INSERT IGNORE INTO users (memberId, username, email, passwordHash, firstName, lastName, role, points, coins, referralCode)
         VALUES (?, ?, ?, ?, ?, ?, 'ceo', 99999, 99999, ?)`,
        [memberId, username, email, ceoHash, `CEO${i}`, 'iDea Memory', `CEO${String(i).padStart(3, '0')}`]
      );
      console.log(`✓ CEO account created: ${username} / ceo252333`);
    } catch (e) {
      console.log(`- CEO account ${username} already exists or error:`, e.message);
    }
  }

  await conn.end();
  console.log('\nMigration v2 completed successfully!');
}

migrate().catch(console.error);
