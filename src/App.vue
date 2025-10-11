<script setup>
import { ref, toRaw } from "vue";
import { storeToRefs } from "pinia";
import { invoke } from "@tauri-apps/api/core";
import WindowCtr from "./components/WindowCtr.vue";
import TxtEditor from "./components/TxtEditor.vue";
import { useBookStore } from "./store/bookStore";
const { curChapter, metaData, toc } = storeToRefs(useBookStore());

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

const openFile = async () => {
  let data = await invoke("open_file", {});
  console.log(data);
  updateCurChapter(data);
};

const saveFile = async () => {
  // await invoke("save_file", { content: toRaw(textareaVal.value) });
};
</script>

<template>
  <div class="container">
    <div class="title-bar">
      <div class="ctrl-bar">
        <button @click="openFile">打开</button>
        <button @click="saveFile">保存</button>
      </div>
      <span class="title">文本编辑器</span>
      <WindowCtr />
    </div>
    <div class="content">
      <div id="leftMenu">
      </div>
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
  width: 200px;
  height: 100%;
  background-color: #f0f0f0;
  border-right: 1px solid #add8e6;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#leftMenu div {
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  text-overflow: ellipsis;
}
</style>
