import { mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

/**
 * 在应用配置目录下创建文件夹
 * @param {string} folderName - 要创建的文件夹名称
 * @returns {Promise<void>}
 */
export async function createFolderInConfigDir(folderName) {
  try {
    // 使用mkdir函数创建文件夹，baseDir参数指定为BaseDirectory.AppConfig
    await mkdir(folderName, {
      baseDir: BaseDirectory.AppConfig,
      recursive: true, // 如果需要创建多级目录，设置为true
    });
    console.log(`文件夹 ${folderName} 创建成功`);
  } catch (error) {
    console.error(`创建文件夹失败:`, error);
    throw error;
  }
}

/**
 * 创建自定义路径的文件夹
 * @param {string} fullPath - 完整的文件夹路径
 * @returns {Promise<void>}
 */
export async function createFolderAtPath(fullPath) {
  try {
    // 直接使用完整路径创建文件夹
    await mkdir(fullPath, {
      recursive: true, // 如果需要创建多级目录，设置为true
    });
    console.log(`文件夹 ${fullPath} 创建成功`);
  } catch (error) {
    console.error(`创建文件夹失败:`, error);
    throw error;
  }
}
