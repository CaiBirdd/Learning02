<script setup>
import Aside from '@/components/aside.vue' //在 Vue 中，自定义组件名如果是小写的 aside，它会和原生 HTML 标签 <aside> 冲突，导致渲染时 Vue 会把它当成普通 HTML 标签，而不是 Vue 组件。
import navHeader from '@/components/navHeader.vue'
</script>

<template>
  <div class="common-layout">

    <el-container> <!-- 渲染后就是一个 <div class="el-container"> 所以可以给他加类名  -->
      <!-- 侧边栏 -->
      <Aside></Aside>
      <el-container>
        <!-- 头部展示 -->
        <el-header>
          <navHeader></navHeader>
        </el-header>
        <!-- 中间内容显示 -->
        <el-main>
          <RouterView></RouterView>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="less">
.common-layout {
  height: 100%;

  .el-container {
    height: 100%;
  }
}
</style>
