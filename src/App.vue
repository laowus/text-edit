<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";

import TxtEditor from "./components/TxtEditor.vue";
import Header from "./components/Header.vue";
</script>

<template>
  <div class="container">
    <Header></Header>
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
  background: #000;
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
