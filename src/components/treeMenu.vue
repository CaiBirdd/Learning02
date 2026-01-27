<script setup>
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/store/menu'

const { menuData,loopIndex } = defineProps(['menuData','loopIndex'])
console.log(menuData,loopIndex)  // ✅ 直接拿到

//点击实现路由切换
const menuStore = useMenuStore()
const router = useRouter()

const handleClick = (item,active) =>{
  router.push(item.meta.path) //实现点击时右侧页面跳转
  menuStore.addMenu(item.meta) //将当前点击的菜单信息传入 就是具体的那一项的数组
  menuStore.updateMenuActive(active) //实现点击的菜单一直高亮 具体实现在aside组件
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
      <!-- 图标需要结合数据动态渲染，图标是一个组件 这里可以看看elementplus的图标格式<el-icon><Plus/></el-icon> -->
      <el-icon size="20">
        <component :is="item.meta.icon"></component>
      </el-icon>
      <span>{{item.meta.name}}</span>
      {{ console.log('item index:', `${loopIndex}-${item.meta.id}`, item.meta.name) }}
    </el-menu-item>
    <!-- 有子菜单的情况 :index="`${index+1}`" 是el-menu的标识 由于递归所以这里是动态的 -->
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