const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();
  const sqlPath = process.argv[2];
  if (!sqlPath) {
    console.error('Usage: node scripts/run-sql.js <path-to-sql-file>');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(__dirname, '..', sqlPath), 'utf8');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    console.log(`Applied ${sqlPath} successfully.`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Failed to run SQL file:', err.message);
  process.exit(1);
});