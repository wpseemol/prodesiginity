import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const [cols] = await conn.query("SHOW COLUMNS FROM users LIKE 'username'");
if (!Array.isArray(cols) || cols.length === 0) {
  await conn.query("ALTER TABLE users ADD COLUMN username VARCHAR(191) NULL");
  console.log("Added username column");
}

const [users] = await conn.query("SELECT id, email, username FROM users");
for (const u of /** @type {{id:number,email:string,username:string|null}[]} */ (
  users
)) {
  if (u.username) continue;
  let base =
    String(u.email)
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "") || `user${u.id}`;
  let candidate = base;
  let n = 1;
  while (true) {
    const [exists] = await conn.query(
      "SELECT id FROM users WHERE username = ? AND id <> ?",
      [candidate, u.id],
    );
    if (!Array.isArray(exists) || exists.length === 0) break;
    candidate = `${base}${n}`;
    n += 1;
  }
  await conn.query("UPDATE users SET username = ? WHERE id = ?", [
    candidate,
    u.id,
  ]);
  console.log("Backfilled", u.id, candidate);
}

await conn.query("ALTER TABLE users MODIFY username VARCHAR(191) NOT NULL");
try {
  await conn.query(
    "CREATE UNIQUE INDEX users_username_key ON users(username)",
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("Duplicate")) throw error;
}

await conn.query(`
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  token_hash VARCHAR(64) NOT NULL,
  user_id INT NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY refresh_tokens_token_hash_key (token_hash),
  KEY refresh_tokens_user_id_idx (user_id),
  CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
`);

console.log("Schema patched");
await conn.end();
