<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import WindowCtr from "./components/WindowCtr.vue";
import TxtEditor from "./components/TxtEditor.vue";
import { initializeDatabase } from "./common/database.js";
import { open } from "./libs/parseBook.js";
import { readTxtFile, getTextFromHTML } from "./common/utils";
import { useBookStore } from "./store/bookStore";

const { curChapter, metaData, toc } = storeToRefs(useBookStore());
window.$ = document.querySelector.bind(document);

const updateCurChapter = (val) => {
  const _chapter = {
    content: val,
    title: "章名",
    bookId: 0,
    content: val,
    toc: [],
  };
  curChapter.value = _chapter;
};

const initDB = async () => {
  try {
    //初始化数据库
    await initializeDatabase();
  } catch (error) {
    console.error("加载用户数据失败:", error);
  }
};

const initDom = () => {
  $("#add-file").addEventListener("change", (e) => {
    // 检查用户是否选择了文件
    if (e.target.files.length > 0) {
      const newFile = e.target.files[0];
      const ext = newFile.name.split(".").pop();
      if (ext === "txt" || ext === "html") {
        let fileStr = "";
        readTxtFile(newFile).then((data) => {
          fileStr = ext === "html" ? getTextFromHTML(data) : data;
          console.log("data", data);
          fileStr = data;
          updateCurChapter(fileStr);
        });
      } else if (ext === "epub" || ext === "mobi") {
        open(newFile).then((res) => {
          console.log(" 02 open", res);
        });
      }
    } else {
      console.log("用户未选择文件");
    }
  });

  $("#add-file-btn").addEventListener("click", () => $("#add-file").click());
};

onMounted(() => {
  initDB();
  initDom();
});
</script>

<template>
  <div class="container">
    <div class="title-bar">
      <div class="ctrl-bar">
        <input
          type="file"
          id="add-file"
          hidden
          accept=".txt,.html,.epub,.mobi,.azw3"
        />
        <button id="add-file-btn">
          <span>导入</span>
        </button>
      </div>
      <span class="title">捡书</span>
      <WindowCtr />
    </div>
    <div class="content">
      <div id="leftMenu"></div>
      <TxtEditor />
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: start;
  height: 100%;
  width: 100%;
}

.title-bar {
  width: 100%;
  height: 25px;
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 5px 10px;
  justify-content: space-between;
  justify-items: center;
}
.title {
  font-size: 16px;
  font-weight: bold;
  flex: 1;
  text-align: center;
  justify-content: center;
  align-items: center;
  user-select: none;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  display: flex;
}

.open-close-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
  gap: 10px;
}

.open-close-btn span {
  font-size: 18px;
  padding: 5px;
}

.open-close-btn span:hover {
  font-size: 18px;
  cursor: pointer;
  background-color: antiquewhite;
}

.ctrl-bar {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
.ctrl-bar button {
  height: 100%;
  padding: 0 10px;
  width: 50px;
  border: none;
  border-radius: 5px;
  background-color: #e5e5e5;
  cursor: pointer;
  font-size: 14px;
}

.text-editor {
  width: 100%;
  flex: 1;
  padding: 10px;
  height: 95%;
}
.text-input {
  width: 95%;
  height: 90vh;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}

.content {
  display: flex;
  flex-direction: row;
  width: 99%;
  height: calc(100vh - 45px);
  background-color: #add8e6;
  box-sizing: border-box !important;
}

#leftMenu {
  height: 100%;
  background-color: #f0f0f0;
  border-right: 1px solid #add8e6;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  width: 200px;
  padding: 0 !important;
}

/* 处理菜单过多时的滚动问题 */
#leftMenu::-webkit-scrollbar {
  width: 6px;
}

#leftMenu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

#leftMenu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

#leftMenu::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
