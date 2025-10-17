import { makeBook } from "./view.js";
import { storeToRefs } from "pinia";
import {
  configure,
  ZipReader,
  Uint8ArrayWriter,
  BlobReader,
} from "@zip.js/zip.js";
import { useBookStore } from "../store/bookStore.js";
import EventBus from "../common/EventBus";
import { addBook } from "../common/database";
import { join, appDataDir } from "@tauri-apps/api/path";
import { exists, remove, writeFile, mkdir } from "@tauri-apps/plugin-fs";

const appDataPath = await appDataDir();
const coversDir = await join(appDataPath, "covers");
const epubDir = await join(appDataPath, "epub");

const generateCustomShortId = () => {
  // 获取时间戳的后8位
  const timestamp = Date.now().toString().slice(-8);
  // 生成随机数
  const random = Math.random().toString(36).substring(2, 8);
  return timestamp + random;
};

// 调用libs/vendor/zip.js 解压epub文件
const unzipEpub = async (file, extractPath) => {
  console.log("开始解压epub文件:", file, extractPath);
  return new Promise(async (resolve, reject) => {
    // 创建图片目录
    const imagesDir = await join(extractPath, "images");
    console.log("创建图片目录:", imagesDir);
    try {
      await mkdir(imagesDir, { recursive: true });
    } catch (error) {
      console.warn("Images directory might already exist:", error);
    }

    try {
      configure({ useWebWorkers: false });
      const reader = new ZipReader(new BlobReader(file));
      const zipEntries = await reader.getEntries();
      console.log("zipEntries", zipEntries);
      // 存储原始图片路径和重命名后的路径的映射
      const imageMap = new Map();
      zipEntries.forEach(async (entry) => {
        // 检查是否为图片文件
        const ext = entry.filename.split(".").pop();
        const imageExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "bmp",
          "webp",
          "svg",
        ];
        if (imageExtensions.includes(ext)) {
          // 生成唯一的文件名，避免冲突
          const uniqueName = `${generateCustomShortId()}.${ext}`;
          console.log("uniqueName", uniqueName);
          const targetPath = await join(imagesDir, uniqueName);
          console.log("targetPath", targetPath);
          // 保存文件
          console.log("entry", entry);
          await entry
            .getData(new Uint8ArrayWriter())
            .then(async (uint8Array) => {
              if (uint8Array.length > 0) {
                await writeFile(targetPath, uint8Array);
                // 记录原始路径和新路径的映射
                imageMap.set(entry.filename, "images/" + uniqueName);
                console.log(
                  `已提取并重命名图片: ${entry.filename} -> ${await join(
                    "images",
                    uniqueName
                  )}`
                );
              }
            });
        }
      });
      resolve({ extractPath, imageMap });
    } catch (error) {
      reject(error);
    }
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
                const fileExists = await exists(coverPath);
                if (fileExists) {
                  await remove(coverPath);
                }
                if (book.metadata.cover && book.metadata.cover.includes(",")) {
                  const base64Data = book.metadata.cover.split(",")[1];
                  const fileBuffer = Buffer.from(base64Data, "base64");
                  await writeFile(coverPath, fileBuffer);
                } else {
                  console.warn("Invalid or missing cover data");
                }
                console.log(`文件已成功写入: ${coverPath}`);
              } catch (error) {
                console.error("处理文件时出错:", error);
                throw error;
              }
            }
            let imageMap = null;
            if (file && file.name.split(".").pop() === "epub") {
              try {
                const curEpubDir = await join(epubDir, `${bookId}`);
                const result = await unzipEpub(file, curEpubDir);
                imageMap = result.imageMap;
                console.log(`EPUB 文件已解压到: ${result.extractPath}`);
              } catch (error) {
                console.error("解压EPUB文件时出错:", error);
                throw error;
              }
            }

            // 插入章节，传入imageMap
            await insertChapter(book, bookId, imageMap);
            setFirst(false);
            
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
const insertChapter = async (book, bookId, imageMap = null) => {
  const insertTocItem = async (item, parentid = null) => {
    const res = await book.resolveHref(item.href);
    // 等待 createDocument 完成
    const doc = await book.sections[res.index].createDocument();
    // 调用修改后的getTextFromHTML函数，传入imageMap
    const str = getTextFromHTML(doc.documentElement.outerHTML, imageMap);
    // 封装发送请求和监听响应为一个 Promise
    await new Promise((resolve, reject) => {
      const successListener = (res) => {
        item.href = res.id;
        resolve(res);
      };
      EventBus.on("addChapterRes", successListener);
      const chapterData = {
        label: item.label,
        href: item.href,
        content: str,
        bookId: bookId,
      };
      EventBus.emit("addChapter", {
        href: parentid,
        chapter: chapterData,
      });
    });

    if (item.subitems) {
      parentid = item.href;
      for (const subitem of item.subitems) {
        await insertTocItem(subitem, parentid);
      }
    }
  };

  // 使用 entries() 方法获取索引和元素
  for (const [index, tocItem] of book.toc.entries()) {
    iCTip(
      "导入 " + tocItem.label + " (" + (index + 1) + "/" + book.toc.length + ")"
    );
    await insertTocItem(tocItem, null);
  }
};

const iCTip = (text) => {
  EventBus.emit("showTip", text);
};
// 修改getTextFromHTML函数，添加图片路径映射参数并保留格式标签
const getTextFromHTML = (htmlString, imageMap = null) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // 定义需要保留的格式标签
  const preserveTags = [
    "B",
    "STRONG", // 加粗
    "I",
    "EM", // 斜体
    "U", // 下划线
    "BR",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6", // 结构标签
    "UL",
    "OL",
    "LI", // 列表
    "IMG", // 图片（已保留）
  ];

  // 递归处理节点，保留指定的标签和图片
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    } else if (node.nodeName === "IMG") {
      // 获取原始src属性
      let src = node.getAttribute("src");
      if (src && imageMap && imageMap.size > 0) {
        // 查找对应的新路径
        // 由于路径格式可能不同，我们需要进行模糊匹配
        let found = false;
        for (let [originalPath, newPath] of imageMap.entries()) {
          if (src.includes(path.basename(originalPath))) {
            console.log(`替换图片路径: ${src} -> ${newPath}`);
            node.setAttribute("src", newPath);
            found = true;
            break;
          }
        }
        if (!found) {
          console.log(`未找到匹配的图片路径: ${src}`);
        }
      }
      // 不再直接返回outerHTML，而是手动构建带自闭合符号的标签
      let imgHtml = `<img`;
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        imgHtml += ` ${attr.name}="${attr.value}"`;
      }
      imgHtml += ` />`;
      console.log("修改后的图片", imgHtml);
      return imgHtml;
    } else if (node.nodeName === "BR") {
      return "\n";
    } else if (node.nodeName === "P") {
      // 处理p标签：替换为换行符
      let result = "\n";
      for (let child of node.childNodes) {
        result += processNode(child);
      }
      result += "\n";
      return result;
    } else if (node.nodeName === "DIV") {
      // 处理div标签：去掉标签但保留内容
      let result = "";
      for (let child of node.childNodes) {
        result += processNode(child);
      }
      return result;
    } else if (preserveTags.includes(node.nodeName)) {
      // 对于其他需要保留的格式标签，保留标签结构
      let result = `<${node.nodeName.toLowerCase()}`;

      // 保留所有属性
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        // 跳过已经处理过的src属性
        if (!(node.nodeName === "IMG" && attr.name === "src")) {
          result += ` ${attr.name}="${attr.value}"`;
        }
      }

      result += ">";

      // 处理子节点
      for (let child of node.childNodes) {
        result += processNode(child);
      }

      // 添加结束标签
      if (!["BR"].includes(node.nodeName)) {
        result += `</${node.nodeName.toLowerCase()}>`;
      }

      return result;
    } else {
      let result = "";
      // 遍历子节点
      for (let child of node.childNodes) {
        result += processNode(child);
      }
      return result;
    }
  }

  return processNode(doc.body) || "";
};
