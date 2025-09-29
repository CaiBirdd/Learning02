<script setup>
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
// defineProps(['menuData'])
// console.log(menuData) 这种写法，可以接收到数据，但是在这里打印不出来
const { menuData,loopIndex } = defineProps(['menuData','loopIndex'])
console.log(menuData,loopIndex)  // ✅ 直接拿到

//点击实现路由切换
const store = useStore()
const router = useRouter()
const handleClick = (item,active) =>{
  router.push(item.meta.path) //实现点击时右侧页面跳转
  store.commit('addMenu', item.meta) //将当前点击的菜单信息传入 就是具体的那一项的数组
  store.commit('updateMenuActive', active) //实现点击的菜单一直高亮
}
</script>


<template>
  <template v-for="(item,index) in menuData"  :key="index">  
    <!--没有三级路由，说明只有一个菜单 没有子菜单的情况-->
    <el-menu-item 
      v-if="!item.children || item.children.length === 0"     
      :index="`${loopIndex}-${item.meta.id}`"
      @click="handleClick(item,`${loopIndex}-${item.meta.id}`)"
    >
      <!-- 图标需要结合数据动态渲染，图标是一个组件 -->
      <el-icon size="20">
        <component :is="item.meta.icon"></component>
      </el-icon>
      <span>{{item.meta.name}}</span>
    </el-menu-item>
    <!-- 有子菜单的情况 -->
    <el-sub-menu v-else :index="`${index+1}`">
      <template #title>  
        <!-- 图标复用上边那快 -->
        <el-icon size="20">
          <component :is="item.meta.icon"></component>
        </el-icon>                 
        <span>{{item.meta.name}}</span>                       
      </template>
      <!-- 这里是递归调用自身 -->
      <treeMenu :menuData="item.children" :loopIndex="`${loopIndex}-${item.meta.id}`"></treeMenu>
    </el-sub-menu>
  </template>

</template>

<style scoped></style>