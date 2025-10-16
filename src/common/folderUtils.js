import { mkdir } from "@tauri-apps/plugin-fs";
import { join, configDir, BaseDirectory } from "@tauri-apps/api/path";

/**
 * 在应用配置目录下创建文件夹
 * @param {string} folderName - 要创建的文件夹名称
 * @returns {Promise<string>} 返回创建的文件夹完整路径
 */
export async function createFolderInConfigDir(folderName) {
  try {
    // 获取配置目录路径
    const cfDir = await configDir();
    const fullPath = await join(cfDir, folderName);

    // 使用mkdir函数创建文件夹
    await mkdir(fullPath, {
      recursive: true, // 如果需要创建多级目录，设置为true
    });

    console.log(`文件夹 ${fullPath} 创建成功`);
    return fullPath; // 返回完整的目录路径
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
