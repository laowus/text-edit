import Database from "@tauri-apps/plugin-sql";

// 存储数据库实例的变量（单例）
let dbInstance = null;

/**
 * 初始化数据库连接
 */
async function initializeDatabase() {
  if (!dbInstance) {
    try {
      dbInstance = await Database.load("sqlite:books.db");
      await createTables();
      console.log("数据库连接成功");
    } catch (error) {
      console.error("数据库连接失败:", error);
      throw error;
    }
  }
  return dbInstance;
}

/**
 * 创建表结构
 */
async function createTables() {
  try {
    await dbInstance.execute(`
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
    await dbInstance.execute(`
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
}

// 导出一个封装了所有数据库操作的对象
// 这样其他组件就可以直接使用这个对象，不需要每次都调用 getDatabase()
export const db = {
  // 获取所有用户
  getAllUsers: async () => {
    const instance = await initializeDatabase();
    return await instance.select("SELECT * FROM ee_book");
  },

  // 添加用户
  addUser: async (username, email) => {
    const instance = await initializeDatabase();
    await instance.execute(
      "INSERT INTO ee_book (title, author, description, cover, toc, isDel, createTime, updateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [username, email]
    );
    return await instance.select(
      "SELECT * FROM ee_book WHERE id = last_insert_rowid()"
    );
  },

  // 根据ID获取用户
  getUserById: async (id) => {
    const instance = await initializeDatabase();
    const result = await instance.select("SELECT * FROM ee_book WHERE id = ?", [
      id,
    ]);
    return result.length > 0 ? result[0] : null;
  },

  // 更新用户
  updateUser: async (id, username, email) => {
    const instance = await initializeDatabase();
    await instance.execute(
      "UPDATE users SET username = ?, email = ? WHERE id = ?",
      [username, email, id]
    );
  },

  // 删除用户
  deleteUser: async (id) => {
    const instance = await initializeDatabase();
    await instance.execute("DELETE FROM users WHERE id = ?", [id]);
  },

  // 执行自定义SQL查询（谨慎使用）
  executeQuery: async (sql, params = []) => {
    const instance = await initializeDatabase();
    return await instance.execute(sql, params);
  },

  // 执行自定义SQL查询并返回结果（谨慎使用）
  selectQuery: async (sql, params = []) => {
    const instance = await initializeDatabase();
    return await instance.select(sql, params);
  },

  // 获取原始数据库实例（用于高级操作，一般不推荐使用）
  getRawInstance: async () => {
    return await initializeDatabase();
  },
};

// 导出初始化函数，供需要的地方使用
export { initializeDatabase };

// 导出默认对象，便于使用不同的导入方式
export default db;
