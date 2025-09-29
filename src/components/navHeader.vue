<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute,useRouter } from 'vue-router' 
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
const route = useRoute() 
const router = useRouter()
const store = useStore()
const selectMenu = computed(() => store.state.menu.selectMenu)


//关闭tab页面 item就是selectMenu中的数组对象，也就是菜单一项，index是其下标
const closeTab = (item,index) =>{
  // 1. 触发 vuex 中的方法，删除 Tab
  store.commit('closeMenu', item)
  // 2. 删除非当前选中页面的逻辑：如果删除的 Tab 不是当前用户正在看的页面，则不跳转
  if(item.path !== route.path){
    return
  }
  
  // 3. 处理删除当前选中 Tab 后的路由跳转逻辑
  
  // 3.1. 检查是否删除的是“最后一项”
  // 注意：这里的 index 是 commit 之前 selectMenu 数组中的下标
  // selectMenu.value.length 已经是 commit 之后的新长度了 (减少了 1)
  if(index === selectMenu.value.length ){ 
    
    // 3.1.1. 删除后 Tab 列表是否为空
    if(!selectMenu.value.length){
      // 如果 Tab 列表空了，跳回首页
      router.push({
        path:'/'
      })
    }else{
      // 3.1.2. 删除的 Tab 是当前 Tab 列表中的最后一项
      // 跳转到新的 Tab 列表中的倒数第二项（即原列表中的倒数第二项）
      router.push({
        path:selectMenu.value[index - 1].path
      })
    }
  }else{
    // 3.2. 删除的 Tab 不是列表的最后一项
    // 跳转到新的 Tab 列表中的当前位置 (原 index 处) 的 Tab
    // (因为删除了原 index 处的 Tab，后面的 Tab 会自动向前移动，填充这个位置)
    router.push({
      path:selectMenu.value[index].path
    })
  }
}
//最右侧头像处退出登录
const handleCommand = (data) =>{
  if(data === 'loginout'){
    localStorage.removeItem('pz_token')
    localStorage.removeItem('pz_userInfo')
    localStorage.removeItem('Vuex_data')
    router.push('/login')
    ElMessage.success('退出登录成功！')
  } 
}
//从vuex拿本地的用户名和昵称 将字符串转化为对象
const userInfo = JSON.parse(localStorage.getItem('pz_userInfo'))
</script>

<template>

  <div class="header-container flex-box space-between">
    <div class="header-left flex-box">
      <!-- 使用vuex的store实例.commit触发改变state的事件 -->
      <el-icon class="icon" @click="store.commit('collapseMenu')">
        <Fold />
      </el-icon>

      <!-- 以下是tab标签 index是在tab栏 selectMenu这个数组对象中的 下标，获取到后方便删除-->
      <ul class="flex-box">
        <li v-for="(item,index) in selectMenu" 
            :key="item.path" 
            class="tab flex-box"
            :class="{ selected: route.path === item.path }">
          <el-icon size="12">
            <component :is="item.icon" />
          </el-icon>
          <router-link class="flex-box text" :to="{ path: item.path }">
            {{ item.name }}
          </router-link>
          <el-icon class="close" size="12" @click="closeTab(item,index)">
            <Close />
          </el-icon>
        </li>
      </ul>
    </div>
    <div class="header-right ">
      <!-- 头像点击有下拉 -->
      <el-dropdown @command="handleCommand">
        <div class="el-dropdown-link flex-box">
          <el-avatar :src="userInfo.avatar" />
          <p class="user-name">{{userInfo.name}}</p>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item  command="loginout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="less" scoped>
.flex-box {
  display: flex;
  align-items: center;
  height: 100%;
  &.space-between {
    justify-content: space-between;
  }
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background-color: #fff;
  padding-right: 25px;

  .header-left {
    height: 100%;

    .icon {
      width: 45px;
      height: 100%;

      &:hover {
        background-color: #f5f5f5;
        cursor: pointer;
      }
    }
    .tab {
      padding: 0 10px;
      height: 100%;

      .text {
        margin: 0 5px;
      }

      .close {
        visibility: hidden;
      }

      &.selected {
        background-color: #f5f5f5;

        i {
          color: #409eff;
        }

        a {
          color: #409eff;
        }
      }
    }

    .tab:hover {
      background-color: #f5f5f5;

      .close {
        visibility: inherit;
        cursor: pointer;
        color: #000;
      }
    }

    a {
      height: 100%;
      color: #333;
      font-size: 15px;
    }
  }

  .header-right {
    .user-name {
      margin-left: 10px;
    }
  }
}
</style>
