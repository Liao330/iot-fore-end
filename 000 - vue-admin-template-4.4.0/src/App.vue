<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style>
.app-main{
  padding: 10px;
}
/* 全局宽度样式，class="full-width"引用即可 */
.full-width {
  width: 100%;
}
/* 去除滚轮 */
/* ::-webkit-scrollbar {
  width: 0 !important;
}
::-webkit-scrollbar {
  width: 0 !important;height: 0;
} */
/* 保留el-table组件的滚动条 */
/* .el-table ::-webkit-scrollbar {
  width: auto !important;
  height: auto !important;
} */
</style>
