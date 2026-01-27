<script setup>
import treeMenu from './treeMenu.vue'
import { computed } from 'vue'
import { useMenuStore } from '@/store/menu'

const menuStore = useMenuStore()

// 访问 Pinia 中 state 的值，同样需要通过计算属性保持响应式
const isCollapse = computed(() => menuStore.isCollapse)
//通过动态路由信息 渲染菜单
const menuData = computed(() => menuStore.routerList)
const handleOpen = ()=>{
}
const handleClose = ()=>{
}
//菜单高亮显示
const active = computed(() => menuStore.menuActive)
</script>

<template>
  <el-menu
    :style = "{ width: !isCollapse ? '230px' : '64px'}"
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="aside-container"
    :default-active="active"
    text-color="#fff"
    @open="handleOpen"
    @close="handleClose"
    :collapse="isCollapse" 
  >
    <!-- 上面 :collapse这个动态属性是elementplus自带的，但是后面是Pinia的 -->
    <p class="logo-lg">{{ !isCollapse ? 'DIDI陪诊' : 'DIDI'}}</p>
    <!-- 封装成组件抽出去了 传进去一个数组-->
    <treeMenu :menuData="menuData" :loopIndex="1"></treeMenu>
  </el-menu>
</template>

<style scoped lang="less">
.aside-container{
  height: 100%;
  .logo-lg{
    font-size: 20px;
    text-align: center;
    height: 50px;
    line-height: 50px;
    color: #fff;
  }
}
</style>