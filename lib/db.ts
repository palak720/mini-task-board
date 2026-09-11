import mysql from 'mysql2/promise';

declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mini_task_board',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });
}

const pool = global._mysqlPool ?? createPool();
if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = pool;
}

export default pool;