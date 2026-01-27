import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' //导入清除默认样式
import pinia from './store' // 改为导入 Pinia 实例
import { useMenuStore } from './store/menu' // 导入 Pinia store
import panelHead from './components/panelHead.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 引入elementplus图标库

//路由前置守卫
router.beforeEach((to, from) => {
  const token = localStorage.getItem('pz_token')
  console.log(token, 'pz_token')
  // 去的页面不是登录页 并且token不存在 跳转登录页
  if (to.path !== '/login' && !token) {
    return '/login'
  } else if (token && to.path === '/login') {
    // 已登录状态访问login跳转首页
    return '/dashboard'
  } else {
    //一切正常，放行，允许这次导航。
    return true
  }
})

// 创建 Vue 应用实例
const app = createApp(App)

// 注册 Pinia (必须在使用 useMenuStore 之前)
app.use(pinia)

// 刷新后白屏 动态路由添加 确保了路由的添加速度快于路由的匹配速度。
// 原 Vuex: store.commit('DynamicMenuRender', ...) 改为 Pinia action 调用
const localData = localStorage.getItem('pinia_menu') // key 从 Vuex_data 改为 pinia_menu
if (localData) {
  const menuStore = useMenuStore()
  const parsedData = JSON.parse(localData)
  // 调用 Pinia action (原 store.commit)
  menuStore.dynamicMenuRender(parsedData.routerList)
  // 原 store.state.menu.routerList 改为直接访问 menuStore.routerList
  menuStore.routerList.forEach((item) => {
    router.addRoute('main', item)
  })
}

// 注册 ElementPlus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册路由
app.use(router)

// 挂载应用
app.mount('#app')

// 全局注册组件 省得都引用了
app.component('panelHead', panelHead)
