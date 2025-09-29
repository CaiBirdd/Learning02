import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'   //导入清除默认样式
import store from './store'
import panelHead from './components/panelHead.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'// 引入elementplus图标库



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
//刷新后白屏 动态路由添加 确保了路由的添加速度快于路由的匹配速度。
const loaclData = localStorage.getItem('Vuex_data')
if (loaclData) {
  store.commit('DynamicMenuRender', JSON.parse(loaclData).menu.routerList)
  store.state.menu.routerList.forEach(item => {
    router.addRoute('main', item)
  })
}



const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}



//创建时选上这里就默认挂载了
app.use(router)
app.mount('#app')
//vuex
app.use(store)
//全局挂在一下 省得都引用了
app.component('panelHead', panelHead)