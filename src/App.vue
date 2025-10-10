<script setup>
import { ref, toRaw } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

// 窗口控制函数
const minimizeApp = async () => {
  try {
    const window = getCurrentWindow();
    await window.minimize();
  } catch (error) {
    console.error("最小化失败:", error);
  }
};

const maximizeApp = async () => {
  try {
    const window = getCurrentWindow();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  } catch (error) {
    console.error("最大化失败:", error);
  }
};

const closeApp = async () => {
  try {
    const window = getCurrentWindow();
    await window.close();
  } catch (error) {
    console.error("关闭失败:", error);
  }
};

const textareaVal = ref("");
const setTextareaVal = (val) => {
  textareaVal.value = val;
};

const openFile = async () => {
  let data = await invoke("open_file", {});
  console.log(data);
  setTextareaVal(data);
};

const saveFile = async () => {
  await invoke("save_file", { content: toRaw(textareaVal.value) });
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

      <div class="open-close-btn">
        <span class="iconfont icon-zuixiaohua" @click="minimizeApp"></span>
        <span
          class="iconfont icon-zuidahua_huaban1"
          @click="maximizeApp"
        ></span>
        <span class="iconfont icon-guanbi" @click="closeApp"></span>
      </div>
    </div>
  </div>
  <div class="text-editor">
    <textarea placeholder="请输入文本" class="text-input" v-model="textareaVal">
    </textarea>
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
</style>
