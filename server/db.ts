import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "hbdwXtYjXKh7yfm.root",
  password: "Te4jOksAz0hiZq9w",
  database: "test",
  ssl: { rejectUnauthorized: true } as any,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
} as any);

export default pool;
