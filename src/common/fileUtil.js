import {
  mkdir,
  writeFile,
  readFile,
  exists,
  remove,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

/**
 * 安全地创建或替换文件
 * @param {string} filePath - 文件路径
 * @param {string|Uint8Array} content - 文件内容
 * @param {object} options - 选项配置
 * @param {BaseDirectory} [options.baseDir] - 基础目录
 * @param {boolean} [options.ensureDir=true] - 是否自动创建父目录
 * @returns {Promise<void>}
 */
export async function safeCreateOrReplaceFile(filePath, content, options = {}) {
  const { baseDir, ensureDir = true } = options;

  try {
    // 1. 确保父目录存在（如果需要）
    if (ensureDir) {
      // 提取目录部分
      const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
      if (dirPath) {
        await mkdir(dirPath, {
          baseDir,
          recursive: true,
        });
      }
    }

    // 2. 检查文件是否存在
    const fileExists = await exists(filePath, { baseDir });

    // 3. 如果文件存在，先删除
    if (fileExists) {
      await remove(filePath, { baseDir });
      console.log(`已删除现有文件: ${filePath}`);
    }

    // 4. 创建新文件
    await writeFile(filePath, content, { baseDir });
    console.log(`文件创建成功: ${filePath}`);
  } catch (error) {
    console.error(`操作文件时出错:`, error);
    throw error;
  }
}
