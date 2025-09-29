<script setup>
import treeMenu from './treeMenu.vue'
//import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const isCollapse = computed(()=> store.state.menu.isCollapse) //访问vuex中state的值需要通过计算属性 menu是模块名称

//const router = useRouter()
//const menuData = ref(router.options.routes[0].children)
//console.log(menuData)
//console.log(router)
//通过动态路由信息 渲染菜单
const menuData = computed(() => store.state.menu.routerList)
const handleOpen = ()=>{
}
const handleClose = ()=>{
}
//菜单高亮显示
const active = computed(() => store.state.menu.menuActive)
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
    <!-- 上面 :collapse这个动态属性是elementplus自带的，但是后面是vuex的 -->
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