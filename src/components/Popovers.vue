<script setup>
import { reactive } from "vue";
import { storeToRefs } from "pinia";
import EventBus from "../common/EventBus";
import { useAppStore } from "../store/appStore";
import Tip from "./Tip.vue";

const { tipShow, tipText } = storeToRefs(useAppStore());
const { showTip, hideTip } = useAppStore();

EventBus.on("showTip", (text) => {
  showTip(text);
});

EventBus.on("hideTip", (text = "完成!") => {
  showTip(text);
  hideTip();
});

ipcRenderer.on("showtip", (event, text) => {
  console.log("text", text);
  showTip(text);
});
ipcRenderer.on("hidetip", () => {
  showTip("完成!");
  hideTip();
});
</script>
<template>
  <div id="popovers">
    <Tip v-show="tipShow">
      <template #text>
        <p v-html="tipText"></p>
      </template>
    </Tip>
  </div>
</template>

<style></style>
