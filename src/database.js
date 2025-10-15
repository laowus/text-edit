import { Database } from 'tauri-plugin-sql-api';

// 初始化数据库连接
const initDatabase = async () => {
  try {
    const db = await Database.load('sqlite:text-edit.db');
    console.log('Database connected successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
};

// 公共数据库方法（示例：创建表）
const createTable = async (db) => {
  await db.execute(
    'CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY, title TEXT, content TEXT, created_at TEXT)'
  );
};

// 添加书籍
const addBook = async (db, title, content) => {
  const createdAt = new Date().toISOString();
  await db.execute(
    'INSERT INTO documents (title, content, created_at) VALUES (?, ?, ?)',
    [title, content, createdAt]
  );
};

// 导出数据库实例和方法
export { initDatabase, createTable, addBook };