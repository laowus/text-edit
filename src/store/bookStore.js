import EventBus from "../common/EventBus";
import { defineStore } from "pinia";

export const useBookStore = defineStore("bookStore", {
  state: () => ({
    isFirst: true,
    metaData: null, //书籍信息
    toc: null, //目录
    curChapter: {
      bookId: 0,
      href: "",
      title: "",
      content: "",
    }, //当前编辑的章节
    isAllEdit: false, //是否全部编辑
    isTitleIn: false, //保留章名在内容里面
    selectColor: "#FF0000",
  }),
  actions: {
    setFirst(isF) {
      this.isFirst = isF;
    },
    setMetaData(metaData) {
      this.metaData = metaData;
    },
    setToc(toc) {
      this.toc = toc;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ["selectColor", "isTitleIn"],
      },
    ],
  },
});
