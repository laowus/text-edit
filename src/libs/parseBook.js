import { makeBook } from "./view.js";

export const open = async (file) => {
  console.log("open=====", file);

  // 将整个处理过程封装在一个 Promise 中
  return new Promise(async (resolve, reject) => {
    try {
      // 1. 先解析书籍内容
      const book = await makeBook(file);
      console.log(book);
    } catch (error) {
      reject(error);
      console.error("处理书籍时出错:", error);
    }
  });
};
