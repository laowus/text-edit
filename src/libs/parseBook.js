import { makeBook } from "./view.js";
import { storeToRefs } from "pinia";
import { useBookStore } from "../store/bookStore.js";
import EventBus from "../common/EventBus";
import { addBook } from "../common/database";
import { join, BaseDirectory, appDataDir } from "@tauri-apps/api/path";
import { exists, remove, writeFile, mkdir } from "@tauri-apps/plugin-fs";
import { safeCreateOrReplaceFile } from "../common/fileUtil.js";

const appDataPath = await appDataDir();
const coversDir = await join(appDataPath, "covers");

/**
 * 保存封面到本地
 * @param {*} coverData string base64 格式
 * @param {*} coverPath string 保存路径
 * @returns void
 */
const saveCoverToLocal = (coverData, coverPath) => {
  return new Promise((resolve, reject) => {
    const base64Data = coverData.split(",")[1];
    const fileBuffer = Buffer.from(base64Data, "base64");
    writeFile(coverPath, fileBuffer);
  });
};

export const open = async (file) => {
  console.log("open=====", file);
  const { setToc, setMetaData, setFirst } = useBookStore();
  const { metaData, isFirst, toc } = storeToRefs(useBookStore());

  // 将整个处理过程封装在一个 Promise 中
  return new Promise(async (resolve, reject) => {
    try {
      // 1. 先解析书籍内容
      const book = await makeBook(file);
      console.log(book);
      // 2. 处理书籍元数据和章节插入
      if (isFirst.value) {
        let _metaData = {
          title: book.metadata.title,
          author: book.metadata.author.name,
          description: book.metadata.description,
        };
        addBook(_metaData).then(async (res) => {
          console.log("addBook 返回最新", res);
          if (res.success) {
            const bookId = res.data.id;
            setMetaData({ ..._metaData, bookId: bookId });
            let coverPath = "";
            // 获取路径
            if (book.metadata.cover) {
              try {
                try {
                  await mkdir(coversDir, { recursive: true });
                } catch (error) {
                  console.warn("Covers directory might already exist:", error);
                }
                const coverPath = await join(coversDir, `${bookId}.jpg`);
                console.log("coverPath", coverPath);
                const fileExists = await exists(coverPath);
                if (fileExists) {
                  await remove(coverPath);
                }
                const base64Data = book.metadata.cover.split(",")[1];
                const fileBuffer = Buffer.from(base64Data, "base64");
                await writeFile(coverPath, fileBuffer);
                console.log(`文件已成功写入: ${coverPath}`);
              } catch (error) {
                console.error("处理文件时出错:", error);
                throw error;
              }
            }
          } else {
            reject(res.error);
          }
        });
      }
    } catch (error) {
      reject(error);
      console.error("处理书籍时出错:", error);
    }
  });
};
