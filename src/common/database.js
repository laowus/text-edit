import Database from "@tauri-apps/plugin-sql";

// 存储数据库实例的变量（单例）
let db = null;

/**
 * 初始化数据库连接
 */
const initializeDatabase = async () => {
  if (!db) {
    try {
      db = await Database.load("sqlite:books.db");
      await createTables();
      console.log("数据库连接成功");
    } catch (error) {
      console.error("数据库连接失败:", error);
      throw error;
    }
  }
};

/**
 * 创建表结构
 */
const createTables = async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ee_book (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            description TEXT,
            cover TEXT,
            toc TEXT,
            isDel INTEGER,
            createTime TEXT,
            updateTime TEXT );
    `);
    await db.execute(`
     CREATE TABLE IF NOT EXISTS ee_chapter (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bookId INTEGER,
            label TEXT,
            href TEXT,
            content TEXT,
            createTime TEXT,
            updateTime TEXT);
    `);
  } catch (error) {
    console.error("创建数据库表失败:", error);
    throw error;
  }
};

// 添加书籍 进行 try catch 处理
const addBook = async (book) => {
  console.log("addBook", book);
  try {
    await db.execute(
      `INSERT INTO ee_book (title, author, description, cover, isDel, createTime, updateTime)
       VALUES (? , ?, ?, ?, 0, datetime('now', 'localtime'), datetime('now', 'localtime'))`,
      [book.title, book.author, book.description, book.cover]
    );
    const result = await db.select(
      "SELECT * FROM ee_book WHERE id = last_insert_rowid()"
    );
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("添加书籍失败:", error);
    return { success: false, error: error.message };
  }
};

const addChapter = async (chapter) => {
  try {
    await db.execute(
      `INSERT INTO ee_chapter (bookId, label, href, content, createTime, updateTime)
       VALUES (? , ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))`,
      [chapter.bookId, chapter.label, chapter.href, chapter.content]
    );
    const result = await db.select(
      "SELECT * FROM ee_chapter WHERE id = last_insert_rowid()"
    );
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("添加章节失败:", error);
    return { success: false, error: error.message };
  }
};

const updateToc = async (bookId, toc) => {
  try {
    await db.execute(`UPDATE ee_book SET toc = ? WHERE id = ?`, [toc, bookId]);
    return { success: true };
  } catch (error) {
    console.error("更新目录失败:", error);
    return { success: false, error: error.message };
  }
};

const getCurChapter = async (bookId, href) => {
  console.log("database.js获取章节", bookId, href);
  try {
    const result = await db.select(
      "SELECT * FROM ee_chapter WHERE bookId = ? AND id = ?",
      [bookId, href]
    );
    console.log("database.js获取章节内容", result);
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("获取章节失败:", error);
    return { success: false, error: error.message };
  }
};

// 统一导出
export { initializeDatabase, addBook, addChapter, updateToc, getCurChapter };
