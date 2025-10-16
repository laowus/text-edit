import { makeBook } from "./view.js";
import { storeToRefs } from "pinia";
import { useBookStore } from "../store/bookStore.js";
import EventBus from "../common/EventBus";
import { addBook } from "../common/database";
import { createFolderInConfigDir } from "../common/folderUtils";
import { join } from "@tauri-apps/api/path";
import { exists, writeFile, remove } from "@tauri-apps/plugin-fs";

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
    writeFile(coverPath, fileBuffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(coverPath);
      }
    });
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
          cover: book.metadata.cover,
        };
        addBook(_metaData).then(async (res) => {
          if (res.success) {
            const bookId = res.bookId;
            setMetaData({ ..._metaData, bookId: bookId });
            const coverDir = await createFolderInConfigDir("covers");
            let coverPath = "";
            if (book.metadata.cover) {
              coverPath = await join(coverDir, `${bookId}.jpg`);
              console.log("coverPath", coverPath);
              //假如coverPath 存在就删除
              const fileExists = await exists(coverPath);
              // 如果文件存在，则删除
              if (fileExists) {
                await remove(coverPath);
                console.log(`文件 ${coverPath} 已存在，已删除`);
              }
              await saveCoverToLocal(book.metadata.cover, coverPath);
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
